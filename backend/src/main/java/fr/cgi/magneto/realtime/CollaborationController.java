package fr.cgi.magneto.realtime;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.model.user.User;
import fr.cgi.magneto.realtime.events.MagnetoUserAction;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.webutils.request.CookieHelper;
import fr.wseduc.webutils.request.filter.UserAuthFilter;
import io.vertx.core.*;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.constants.Field.*;
import static fr.cgi.magneto.realtime.CollaborationHelper.*;

public class CollaborationController implements Handler<ServerWebSocket> {

    private static final Logger log = LoggerFactory.getLogger(CollaborationController.class);
    private final Map<String, Map<String, ServerWebSocket>> boardIdToWSIdToWS = new HashMap<>();
    private final Map<String, User> wsIdToUser = new HashMap<>();
    private final Vertx vertx;
    private final MagnetoCollaborationService magnetoCollaborationService;
    private final int maxConnections;
    private final int maxConnectionsPerBoard;
    private final double warningThreshold = 0.9;

    public CollaborationController(ServiceFactory serviceFactory) {
        log.info("[Magneto@CollaborationController] Initializing CollaborationController");
        this.vertx = serviceFactory.vertx();
        this.magnetoCollaborationService = serviceFactory.magnetoCollaborationService();
        this.maxConnections = serviceFactory.magnetoConfig().websocketConfig().getMaxUsers();
        this.maxConnectionsPerBoard = serviceFactory.magnetoConfig().websocketConfig().getMaxUsersPerBoard();

        log.info("[Magneto@CollaborationController] Configuration - maxConnections: " + maxConnections + ", maxConnectionsPerBoard: " + maxConnectionsPerBoard);

        // On watch le status global, s'il est mauvais on close toutes les connections
        this.magnetoCollaborationService.subscribeToStatusChanges(newStatus -> {
            log.info("[Magneto@CollaborationController] Status changed to: " + newStatus);
            if (RealTimeStatus.ERROR.equals(newStatus) || RealTimeStatus.STOPPED.equals(newStatus)) {
                log.warn("[Magneto@CollaborationController] Closing all connections due to status change: " + newStatus);
                this.closeConnections();
            }
        });

        // Subscription aux messages avec gestion des messages différenciés et Redis
        this.magnetoCollaborationService.subscribeToNewMessagesToSend(messages -> {
            if (messages.isNotEmpty()) {
                log.info("[Magneto@CollaborationController] Received " + messages.getMessages().size() + " messages to broadcast");
                List<MagnetoMessage> messageList = messages.getMessages();

                // Vérifier si on a des messages avec différenciation readOnly/fullAccess
                boolean hasReadOnlyOrFullAccess = messageList.stream().anyMatch(msg -> msg.getActionId() != null
                        && (Arrays.asList(READONLY, FULLACCESS).contains(msg.getActionId())));

                // Vérifier si on a des messages avec différenciation actualUser/otherUsers
                boolean hasActualUserOrOtherUsers = messageList.stream().anyMatch(msg -> msg.getActionId() != null
                        && (Arrays.asList(ACTUALUSER, OTHERUSERS).contains(msg.getActionId())));

                log.info("[Magneto@CollaborationController] Message types - hasReadOnlyOrFullAccess: " + hasReadOnlyOrFullAccess + ", hasActualUserOrOtherUsers: " + hasActualUserOrOtherUsers);

                if (hasReadOnlyOrFullAccess) {
                    log.info("[Magneto@CollaborationController] Broadcasting readOnly/fullAccess messages");
                    this.broadcastReadOnlyFullAccessMessages(messageList, messages.getExceptWSId());
                } else if (hasActualUserOrOtherUsers) {
                    log.info("[Magneto@CollaborationController] Broadcasting actualUser/otherUsers messages");
                    this.broadcastActualUserOtherUsersMessages(messageList, messages.getExceptWSId());
                } else {
                    log.info("[Magneto@CollaborationController] Broadcasting standard messages - allowExternal: " + messages.isAllowExternal() + ", allowInternal: " + messages.isAllowInternal());
                    if (messages.isAllowExternal() && !messages.isAllowInternal()) {
                        log.info("[Magneto@CollaborationController] Broadcasting external Redis messages");
                        this.broadcastExternalMessagesToUsers(messageList, messages.getExceptWSId());
                    } else {
                        log.info("[Magneto@CollaborationController] Broadcasting internal messages");
                        this.broadcastMessagesToUsers(messageList, messages.getExceptWSId());
                    }
                }
            } else {
                log.info("[Magneto@CollaborationController] No messages to broadcast");
            }
        });

        log.info("[Magneto@CollaborationController] CollaborationController initialized successfully");
    }

    /**
     * What happen when a WS payload is received from the front
     */
    @Override
    public void handle(ServerWebSocket ws) {
        final long startTime = System.currentTimeMillis();
        log.info("[Magneto@CollaborationController::handle] NEW WEBSOCKET CONNECTION - Starting handle process");

        try {
            ws.pause();
            log.info("[Magneto@CollaborationController::handle] WebSocket paused successfully");

            final String sessionId = CookieHelper.getInstance().getSigned(UserAuthFilter.SESSION_ID, ws);
            log.info("[Magneto@CollaborationController::handle] Session ID extracted: " + (sessionId != null ? "PRESENT" : "NULL"));

            final Optional<String> optionalBoardId = getBoardId(ws.path());
            log.info("[Magneto@CollaborationController::handle] Board ID extraction - path: " + ws.path() + ", boardId present: " + optionalBoardId.isPresent());

            if (!optionalBoardId.isPresent()) {
                log.error("[Magneto@CollaborationController::handle] No board id found - closing websocket");
                try {
                    ws.close((short) 1003, "Invalid board ID");
                } catch (Exception e) {
                    log.error("[Magneto@CollaborationController::handle] Failed to close websocket for invalid board ID", e);
                }
                return;
            }

            final String boardId = optionalBoardId.get();
            final String wsId = UUID.randomUUID().toString();
            log.info("[Magneto@CollaborationController::handle] Generated wsId: " + wsId + " for boardId: " + boardId);

            // Setup exception handler early
            ws.exceptionHandler(ex -> {
                log.error("[Magneto@CollaborationController::handle] WebSocket exception for wsId: " + wsId + ", boardId: " + boardId + " - Exception: " + ex.getMessage(), ex);
                log.info("[Magneto@CollaborationController::handle] Current connections: " + wsIdToUser.size() + " total, board connections: " +
                        (boardIdToWSIdToWS.containsKey(boardId) ? boardIdToWSIdToWS.get(boardId).size() : 0));
            });

            log.info("[Magneto@CollaborationController::handle] Calling UserUtils.getSession for sessionId check");
            UserUtils.getSession(vertx.eventBus(), sessionId, infos -> {
                final long sessionTime = System.currentTimeMillis();
                log.info("[Magneto@CollaborationController::handle] UserUtils.getSession callback executed in " + (sessionTime - startTime) + "ms");

                try {
                    if (infos == null) {
                        log.error("[Magneto@CollaborationController::handle] User not authenticated - infos is null - closing websocket");
                        try {
                            ws.close((short) 1008, "Authentication failed");
                        } catch (Exception e) {
                            log.error("[Magneto@CollaborationController::handle] Failed to close websocket for auth failure", e);
                        }
                        return;
                    }

                    log.info("[Magneto@CollaborationController::handle] User authentication successful, converting session");
                    final UserInfos session = UserUtils.sessionToUserInfos(infos);
                    final String userId = session.getUserId();
                    log.info("[Magneto@CollaborationController::handle] User session converted - userId: " + userId + ", username: " + session.getUsername());

                    log.info("[Magneto@CollaborationController::handle] Starting onConnect process for wsId: " + wsId);
                    onConnect(session, boardId, wsId, ws)
                            .onSuccess(onSuccess -> {
                                final long connectTime = System.currentTimeMillis();
                                log.info("[Magneto@CollaborationController::handle] onConnect SUCCESS in " + (connectTime - sessionTime) + "ms - resuming websocket");

                                try {
                                    ws.resume();
                                    log.info("[Magneto@CollaborationController::handle] WebSocket resumed successfully for wsId: " + wsId);

                                    // Déclarer le timer ID dans un tableau pour pouvoir le modifier dans les lambdas
                                    final long[] pingTimerId = new long[1];

                                    // Setup close handler AVANT de démarrer le ping
                                    AtomicBoolean connectionClosed = new AtomicBoolean(false);
                                    ws.closeHandler(e -> {
                                        if (pingTimerId[0] > 0) {
                                            vertx.cancelTimer(pingTimerId[0]);
                                        }
                                        if (connectionClosed.compareAndSet(false, true)) {
                                            log.info("[Magneto@CollaborationController::handle] Connection closed normally for wsId: " + wsId + ", boardId: " + boardId + ", userId: " + userId);
                                            onCloseWSConnection(boardId, userId, wsId);
                                        }
                                    });

                                    // MAINTENANT démarrer le ping
                                    pingTimerId[0] = vertx.setPeriodic(45000, timerId -> {
                                        if (!ws.isClosed()) {
                                            log.debug("[Magneto@CollaborationController] Sending ping to wsId: " + wsId);
                                            ws.writePing(Buffer.buffer("ping"));
                                        } else {
                                            log.debug("[Magneto@CollaborationController] WebSocket closed, cancelling ping timer for wsId: " + wsId);
                                            vertx.cancelTimer(timerId);
                                        }
                                    });

                                    ws.frameHandler(frame -> {
                                        log.info("[Magneto@CollaborationController::handle] Frame received for wsId: " + wsId + " - type: " +
                                                (frame.isBinary() ? "BINARY" : frame.isText() ? "TEXT" : frame.isClose() ? "CLOSE" : "OTHER"));

                                        try {
                                            if (frame.isBinary()) {
                                                log.warn("[Magneto@CollaborationController::handle] Binary frame not handled for wsId: " + wsId);
                                            }
                                            else if (frame.isText()){
                                                final String message = frame.textData();
                                                log.info("[Magneto@CollaborationController::handle] Text frame received for wsId: " + wsId + " - length: " + message.length());

                                                final MagnetoUserAction action = Json.decodeValue(message, MagnetoUserAction.class);
                                                log.info("[Magneto@CollaborationController::handle] Action decoded: " + action.getType() + " for wsId: " + wsId);

                                                this.magnetoCollaborationService.pushEvent(boardId, session, action, wsId, false);
                                            }
                                            else if (frame.isClose()) {
                                                log.info("[Magneto@CollaborationController::handle] Close frame received from client for wsId: " + wsId);
                                                if (connectionClosed.compareAndSet(false, true)) {
                                                    onCloseWSConnection(boardId, userId, wsId);
                                                }
                                            }
                                        } catch (Exception e) {
                                            log.error("[Magneto@CollaborationController::handle] Error parsing frame for wsId: " + wsId + " - keeping connection open", e);
                                        }
                                    });

                                    final long totalTime = System.currentTimeMillis();
                                    log.info("[Magneto@CollaborationController::handle] WEBSOCKET SETUP COMPLETE for wsId: " + wsId + " - total time: " + (totalTime - startTime) + "ms");

                                } catch (Exception e) {
                                    log.error("[Magneto@CollaborationController::handle] Exception during websocket resume for wsId: " + wsId, e);
                                    try {
                                        ws.close((short) 1011, "Resume failed");
                                    } catch (Exception ex) {
                                        log.error("[Magneto@CollaborationController::handle] Failed to close websocket after resume error", ex);
                                    }
                                }
                            })
                            .onFailure(th -> {
                                final long failTime = System.currentTimeMillis();
                                log.error("[Magneto@CollaborationController::handle] onConnect FAILED in " + (failTime - sessionTime) + "ms - closing websocket for wsId: " + wsId, th);
                                try {
                                    ws.close((short) 1011, "Connection setup failed");
                                } catch (Exception e) {
                                    log.error("[Magneto@CollaborationController::handle] Failed to close websocket after onConnect failure", e);
                                }
                            });

                } catch (Exception e) {
                    log.error("[Magneto@CollaborationController::handle] Exception in session callback for wsId: " + wsId, e);
                    try {
                        ws.resume();
                        ws.close((short) 1011, "Session processing error");
                    } catch (Exception ex) {
                        log.error("[Magneto@CollaborationController::handle] Failed to close websocket after session error", ex);
                    }
                }
            });

        } catch (Exception e) {
            log.error("[Magneto@CollaborationController::handle] Exception in handle method", e);
            try {
                ws.close((short) 1011, "Server error");
            } catch (Exception ex) {
                log.error("[Magneto@CollaborationController::handle] Failed to close websocket after handle error", ex);
            }
        }
    }

    /**
     * Called when a user arrives at the board -> we create a new WS connection for him, add it to the pool and inform other users of the board
     */
    private Future<Void> onConnect(final UserInfos user, final String boardId, final String wsId, final ServerWebSocket ws) {
        log.info("[Magneto@CollaborationController::onConnect] Starting connection process for wsId: " + wsId + ", boardId: " + boardId + ", userId: " + user.getUserId());

        int currentPlatformConnections = wsIdToUser.size();
        int currentBoardConnections = getConnectedUsersCountForBoard(boardIdToWSIdToWS, boardId);
        log.info("[Magneto@CollaborationController::onConnect] Current connections - platform: " + currentPlatformConnections + ", board: " + currentBoardConnections);

        String connectionLimitsStatus = getConnectionLimitsStatus(boardId, user.getUserId(), currentPlatformConnections,
                currentBoardConnections, maxConnections, maxConnectionsPerBoard, warningThreshold);
        log.info("[Magneto@CollaborationController::onConnect] Connection limits check result: " + connectionLimitsStatus);

        // Si on a dépassé le nombre de connection limite (total ou par board)
        if (!connectionLimitsStatus.equals(OK)) {
            log.warn("[Magneto@CollaborationController::onConnect] Maximum connections exceeded - status: " + connectionLimitsStatus);
            try {
                ws.close((short) 1013, connectionLimitsStatus);
            } catch (Exception e) {
                log.error("[Magneto@CollaborationController::onConnect] Failed to close websocket for connection limit", e);
            }
            return Future.failedFuture("[Magneto@CollaborationController::onConnect] Maximum connections exceeded");
        }

        log.info("[Magneto@CollaborationController::onConnect] Adding websocket to pool for wsId: " + wsId);
        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
        wsIdToWs.put(wsId, ws);
        log.info("[Magneto@CollaborationController::onConnect] WebSocket added to pool - board now has " + wsIdToWs.size() + " connections");

        final Promise<Void> promise = Promise.promise();

        log.info("[Magneto@CollaborationController::onConnect] Calling magnetoCollaborationService.onNewConnection");
        this.magnetoCollaborationService.onNewConnection(boardId, user, wsId, wsIdToUser)
                .onSuccess(messages -> {
                    log.info("[Magneto@CollaborationController::onConnect] onNewConnection succeeded with " + messages.size() + " messages");
                })
                .onFailure(err -> {
                    log.error("[Magneto@CollaborationController::onConnect] onNewConnection failed for wsId: " + wsId, err);
                })
                .compose(messages -> {
                    log.info("[Magneto@CollaborationController::onConnect] Starting broadcast of " + messages.size() + " messages");
                    return broadcastMessagesToUsers(messages, null)
                            .onSuccess(v -> {
                                log.info("[Magneto@CollaborationController::onConnect] Broadcast succeeded for wsId: " + wsId);
                            })
                            .onFailure(err -> {
                                log.error("[Magneto@CollaborationController::onConnect] Broadcast failed for wsId: " + wsId, err);
                            });
                })
                .onComplete(ar -> {
                    if (ar.succeeded()) {
                        log.info("[Magneto@CollaborationController::onConnect] Connection process COMPLETED successfully for wsId: " + wsId);
                    } else {
                        log.error("[Magneto@CollaborationController::onConnect] Connection process FAILED for wsId: " + wsId, ar.cause());
                        // Remove from pool if connection failed
                        wsIdToWs.remove(wsId);
                        log.info("[Magneto@CollaborationController::onConnect] Removed failed connection from pool");
                    }
                    promise.handle(ar);
                });

        return promise.future();
    }

    /**
     * Called when a user leaves the board -> we remove its WS connection from the pool and inform other users of the board
     */
    protected void onCloseWSConnection(final String boardId, final String userId, final String wsId) {
        log.info("[Magneto@CollaborationController::onCloseWSConnection] Processing disconnection for wsId: " + wsId + ", boardId: " + boardId + ", userId: " + userId);

        this.magnetoCollaborationService.onNewDisconnection(boardId, userId, wsId)
                .onSuccess(messages -> {
                    log.info("[Magneto@CollaborationController::onCloseWSConnection] onNewDisconnection succeeded with " + messages.size() + " messages");
                })
                .onFailure(err -> {
                    log.error("[Magneto@CollaborationController::onCloseWSConnection] onNewDisconnection failed for wsId: " + wsId, err);
                })
                .compose(messages -> {
                    log.info("[Magneto@CollaborationController::onCloseWSConnection] Broadcasting disconnection messages");
                    return this.broadcastMessagesToUsers(messages, wsId);
                })
                .onComplete(e -> {
                    if (e.succeeded()) {
                        log.info("[Magneto@CollaborationController::onCloseWSConnection] Disconnection broadcast completed successfully");
                    } else {
                        log.error("[Magneto@CollaborationController::onCloseWSConnection] Disconnection broadcast failed", e.cause());
                    }

                    final Map<String, ServerWebSocket> wss = boardIdToWSIdToWS.get(boardId);
                    if (wss != null) {
                        if (wss.remove(wsId) == null) {
                            log.warn("[Magneto@CollaborationController::onCloseWSConnection] No websocket removed for wsId: " + wsId);
                        } else {
                            log.info("[Magneto@CollaborationController::onCloseWSConnection] WebSocket removed successfully - board now has " + wss.size() + " connections");
                        }

                        if (wss.isEmpty()) {
                            boardIdToWSIdToWS.remove(boardId);
                            log.info("[Magneto@CollaborationController::onCloseWSConnection] Removed empty board map for boardId: " + boardId);
                        }
                    }

                    User removedUser = wsIdToUser.remove(wsId);
                    if (removedUser != null) {
                        log.info("[Magneto@CollaborationController::onCloseWSConnection] User removed from pool - total connections: " + wsIdToUser.size());
                    } else {
                        log.warn("[Magneto@CollaborationController::onCloseWSConnection] No user found to remove for wsId: " + wsId);
                    }
                });
    }

    // Broadcasts / closing

    /**
     * Close all WS connections from the pool
     */
    private void closeConnections() {
        log.warn("[Magneto@CollaborationController::closeConnections] Closing ALL websocket connections - total: " +
                boardIdToWSIdToWS.values().stream().mapToInt(Map::size).sum());

        boardIdToWSIdToWS.values().stream().flatMap(e -> e.values().stream()).forEach(ws -> {
            try {
                ws.close();
            } catch (Exception e) {
                log.error("[Magneto@CollaborationController::closeConnections] Error closing websocket", e);
            }
        });

        boardIdToWSIdToWS.clear();
        wsIdToUser.clear();
        log.warn("[Magneto@CollaborationController::closeConnections] All connections closed and pools cleared");
    }

    /**
     * Diffuse les messages externes (provenant de Redis) à tous les utilisateurs locaux
     */
    private Future<Void> broadcastExternalMessagesToUsers(List<MagnetoMessage> messages, String exceptWsId) {
        log.info("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Broadcasting " + messages.size() + " external messages, except wsId: " + exceptWsId);
        List<Future> futures = new ArrayList<>();

        for (MagnetoMessage message : messages) {
            final String payload = message.toJson().encode();
            final String boardId = message.getBoardId();
            log.info("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Message payload size: " + payload.length() + " bytes for board: " + boardId);

            final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
            log.info("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Found " + wsIdToWs.size() + " connections for board: " + boardId);

            for (Map.Entry<String, ServerWebSocket> entry : wsIdToWs.entrySet()) {
                if (entry.getKey().equals(exceptWsId) || entry.getValue().isClosed()) {
                    continue;
                }

                ServerWebSocket ws = entry.getValue();
                Promise<Void> writePromise = Promise.promise();

                vertx.setTimer(1L, p -> {
                    try {
                        ws.writeTextMessage(payload, ar -> {
                            if (ar.succeeded()) {
                                log.info("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Message sent successfully to wsId: " + entry.getKey());
                                writePromise.complete();
                            } else {
                                log.warn("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Failed to send message to wsId: " + entry.getKey() + " - " + ar.cause().getMessage());
                                writePromise.fail(ar.cause());
                            }
                        });
                    } catch (Throwable e) {
                        log.error("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Exception writing message to wsId: " + entry.getKey(), e);
                        writePromise.fail(e);
                    }
                });

                futures.add(writePromise.future());
            }
        }

        if (futures.isEmpty()) {
            log.info("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] No messages to send");
            return Future.succeededFuture();
        }

        return CompositeFuture.join(futures).mapEmpty();
    }

    /**
     * Gère les messages avec différenciation readOnly/fullAccess
     */
    private Future<Void> broadcastReadOnlyFullAccessMessages(List<MagnetoMessage> messages, String exceptWsId) {
        log.info("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Broadcasting readOnly/fullAccess messages, except wsId: " + exceptWsId);

        // Séparer les messages
        Optional<MagnetoMessage> readOnlyMessage = messages.stream()
                .filter(m -> READONLY.equals(m.getActionId()))
                .findFirst();

        Optional<MagnetoMessage> fullAccessMessage = messages.stream()
                .filter(m -> FULLACCESS.equals(m.getActionId()))
                .findFirst();

        if (!readOnlyMessage.isPresent()) {
            log.warn("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] No readOnly message found");
            return Future.succeededFuture();
        }

        String boardId = readOnlyMessage.get().getBoardId();
        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
        log.info("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Found " + wsIdToWs.size() + " connections for board: " + boardId);

        List<Future> futures = new ArrayList<>();

        for (Map.Entry<String, ServerWebSocket> entry : wsIdToWs.entrySet()) {
            String wsId = entry.getKey();
            ServerWebSocket ws = entry.getValue();

            if (wsId.equals(exceptWsId) || ws.isClosed()) {
                continue;
            }

            User user = wsIdToUser.get(wsId);
            if (user == null) {
                log.warn("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] No user found for wsId: " + wsId);
                continue;
            }

            // Choisir le bon message selon le statut readOnly de l'utilisateur
            MagnetoMessage messageToSend = user.getRights().isReadOnly() ?
                    readOnlyMessage.get() : fullAccessMessage.get();
            String payload = messageToSend.toJson().encode();
            log.info("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Sending " +
                    (user.getRights().isReadOnly() ? "readOnly" : "fullAccess") + " message to wsId: " + wsId);

            Promise<Void> writePromise = Promise.promise();
            vertx.setTimer(1L, p -> {
                try {
                    ws.writeTextMessage(payload, ar -> {
                        if (ar.succeeded()) {
                            writePromise.complete();
                        } else {
                            log.warn("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Failed to send message to wsId: " + wsId + " - " + ar.cause().getMessage());
                            writePromise.fail(ar.cause());
                        }
                    });
                } catch (Throwable e) {
                    log.error("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Exception writing message to wsId: " + wsId, e);
                    writePromise.fail(e);
                }
            });
            futures.add(writePromise.future());
        }

        if (futures.isEmpty()) {
            log.info("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] No messages to send");
            return Future.succeededFuture();
        }

        return CompositeFuture.join(futures).mapEmpty();
    }

    /**
     * Gère les messages avec différenciation actualUser/otherUsers
     */
    private Future<Void> broadcastActualUserOtherUsersMessages(List<MagnetoMessage> messages, String exceptWsId) {
        log.info("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Broadcasting actualUser/otherUsers messages, except wsId: " + exceptWsId);

        // Séparer les messages
        Optional<MagnetoMessage> actualUserMessage = messages.stream()
                .filter(m -> ACTUALUSER.equals(m.getActionId()))
                .findFirst();

        Optional<MagnetoMessage> otherUsersMessage = messages.stream()
                .filter(m -> OTHERUSERS.equals(m.getActionId()))
                .findFirst();

        if (!actualUserMessage.isPresent()) {
            log.warn("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] No actualUser message found");
            return Future.succeededFuture();
        }

        String boardId = actualUserMessage.get().getBoardId();
        String actualUserId = actualUserMessage.get().getUserId();
        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
        log.info("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Found " + wsIdToWs.size() + " connections for board: " + boardId + ", actualUserId: " + actualUserId);

        List<Future> futures = new ArrayList<>();

        for (Map.Entry<String, ServerWebSocket> entry : wsIdToWs.entrySet()) {
            String wsId = entry.getKey();
            ServerWebSocket ws = entry.getValue();

            if (wsId.equals(exceptWsId) || ws.isClosed()) {
                continue;
            }

            User user = wsIdToUser.get(wsId);
            if (user == null) {
                log.warn("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] No user found for wsId: " + wsId);
                continue;
            }

            // Choisir le bon message selon si c'est l'utilisateur actuel ou un autre
            MagnetoMessage messageToSend = user.getUserId().equals(actualUserId) ?
                    actualUserMessage.get() : otherUsersMessage.get();
            String payload = messageToSend.toJson().encode();
            log.info("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Sending " +
                    (user.getUserId().equals(actualUserId) ? "actualUser" : "otherUsers") + " message to wsId: " + wsId);

            Promise<Void> writePromise = Promise.promise();
            vertx.setTimer(1L, p -> {
                try {
                    ws.writeTextMessage(payload, ar -> {
                        if (ar.succeeded()) {
                            writePromise.complete();
                        } else {
                            log.warn("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Failed to send message to wsId: " + wsId + " - " + ar.cause().getMessage());
                            writePromise.fail(ar.cause());
                        }
                    });
                } catch (Throwable e) {
                    log.error("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Exception writing message to wsId: " + wsId, e);
                    writePromise.fail(e);
                }
            });
            futures.add(writePromise.future());
        }

        if (futures.isEmpty()) {
            log.info("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] No messages to send");
            return Future.succeededFuture();
        }

        return CompositeFuture.join(futures).mapEmpty();
    }

    /**
     * Envoie un même message à tous les WS actifs du pool (= tous les users dans le board)
     */
    private Future<Void> broadcastMessagesToUsers(final List<MagnetoMessage> messages, final String exceptWsId) {
        log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] Broadcasting " + messages.size() + " standard messages, except wsId: " + exceptWsId);

        final List<Future> futures = messages.stream()
                .map(message -> {
                    final String payload = message.toJson().encode();
                    final String boardId = message.getBoardId();
                    log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] Processing message for board: " + boardId + ", payload size: " + payload.length() + " bytes");

                    if (payload.length() > 100000) { // Log large messages
                        log.warn("[Magneto@CollaborationController::broadcastMessagesToUsers] LARGE MESSAGE detected: " + payload.length() + " bytes for board: " + boardId);
                    }

                    final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
                    log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] Found " + wsIdToWs.size() + " connections for board: " + boardId);

                    final List<Future> writeMessagesPromise = wsIdToWs.entrySet().stream()
                            .filter(e -> !e.getKey().equals(exceptWsId))
                            .map(Map.Entry::getValue)
                            .filter(ws -> {
                                boolean isOpen = !ws.isClosed();
                                if (!isOpen) {
                                    log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] Skipping closed websocket");
                                }
                                return isOpen;
                            })
                            .map(ws -> {
                                final Promise<Void> writeMessagePromise = Promise.promise();
                                vertx.setTimer(1L, p -> {
                                    try {
                                        ws.writeTextMessage(payload, ar -> {
                                            if (ar.succeeded()) {
                                                log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] Message sent successfully");
                                                writeMessagePromise.complete();
                                            } else {
                                                log.warn("[Magneto@CollaborationController::broadcastMessagesToUsers] Failed to send message: " + ar.cause().getMessage());
                                                writeMessagePromise.fail(ar.cause());
                                            }
                                        });
                                    }
                                    catch (Throwable e) {
                                        log.error("[Magneto@CollaborationController::broadcastMessagesToUsers] Exception writing to websocket", e);
                                        writeMessagePromise.fail(e);
                                    }
                                });
                                return writeMessagePromise.future();
                            }).collect(Collectors.toList());

                    if (writeMessagesPromise.isEmpty()) {
                        log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] No websockets to write to for board: " + boardId);
                        return Future.succeededFuture();
                    }

                    return CompositeFuture.join(writeMessagesPromise).mapEmpty()
                            .onSuccess(v -> log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] All writes completed for board: " + boardId))
                            .onFailure(err -> log.error("[Magneto@CollaborationController::broadcastMessagesToUsers] Some writes failed for board: " + boardId, err));
                })
                .collect(Collectors.toList());

        if (futures.isEmpty()) {
            log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] No futures to join");
            return Future.succeededFuture();
        }

        log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] Joining " + futures.size() + " broadcast futures");
        return CompositeFuture.join(futures)
                .onSuccess(v -> log.info("[Magneto@CollaborationController::broadcastMessagesToUsers] All broadcasts completed successfully"))
                .onFailure(err -> log.error("[Magneto@CollaborationController::broadcastMessagesToUsers] Some broadcasts failed", err))
                .mapEmpty();
    }
}