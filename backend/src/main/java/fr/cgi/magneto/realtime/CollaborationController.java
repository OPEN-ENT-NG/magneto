package fr.cgi.magneto.realtime;

import com.fasterxml.jackson.core.JsonProcessingException;
import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.model.user.User;
import fr.cgi.magneto.realtime.events.MagnetoUserAction;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.webutils.request.CookieHelper;
import fr.wseduc.webutils.request.filter.UserAuthFilter;
import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
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
        this.vertx = serviceFactory.vertx();
        this.magnetoCollaborationService = serviceFactory.magnetoCollaborationService();
        this.maxConnections = serviceFactory.magnetoConfig().websocketConfig().getMaxUsers();
        this.maxConnectionsPerBoard = serviceFactory.magnetoConfig().websocketConfig().getMaxUsersPerBoard();

        // On watch le status global, s'il est mauvais on close toutes les connections
        this.magnetoCollaborationService.subscribeToStatusChanges(newStatus -> {
            if (RealTimeStatus.ERROR.equals(newStatus) || RealTimeStatus.STOPPED.equals(newStatus)) {
                this.closeConnections();
            }
        });

        // Subscription aux messages avec gestion des messages différenciés et Redis
        this.magnetoCollaborationService.subscribeToNewMessagesToSend(messages -> {
            if (messages.isNotEmpty()) {
                List<MagnetoMessage> messageList = messages.getMessages();

                // Vérifier si on a des messages avec différenciation readOnly/fullAccess
                boolean hasReadOnlyOrFullAccess = messageList.stream().anyMatch(msg -> msg.getActionId() != null
                        && (Arrays.asList(READONLY, FULLACCESS).contains(msg.getActionId())));

                // Vérifier si on a des messages avec différenciation actualUser/otherUsers
                boolean hasActualUserOrOtherUsers = messageList.stream().anyMatch(msg -> msg.getActionId() != null
                        && (Arrays.asList(ACTUALUSER, OTHERUSERS).contains(msg.getActionId())));

                if (hasReadOnlyOrFullAccess) {
                    // Messages avec différenciation par droits utilisateur
                    try {
                        this.broadcastReadOnlyFullAccessMessages(messageList, messages.getExceptWSId());
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                    }
                } else if (hasActualUserOrOtherUsers) {
                    // Messages avec différenciation par utilisateur actuel vs autres
                    this.broadcastActualUserOtherUsersMessages(messageList, messages.getExceptWSId());
                } else {
                    // Messages standards - gérer aussi les messages Redis externes
                    if (messages.isAllowExternal() && !messages.isAllowInternal()) {
                        // Message provenant de Redis - diffuser à tous les utilisateurs locaux
                        this.broadcastExternalMessagesToUsers(messageList, messages.getExceptWSId());
                    } else {
                        // Messages internes normaux
                        this.broadcastMessagesToUsers(messageList, messages.getExceptWSId());
                    }
                }
            }
        });
    }

    /**
     * What happen when a WS payload is received from the front
     */
    @Override
    public void handle(ServerWebSocket ws) {

        ws.pause();
        log.info("[Magneto@CollaborationController::handle] Handle websocket");

        final String sessionId = CookieHelper.getInstance().getSigned(UserAuthFilter.SESSION_ID, ws);
        final Optional<String> optionalBoardId = getBoardId(ws.path());
        if (!optionalBoardId.isPresent()) {
            log.error("[Magneto@CollaborationController::handle] No board id");
            return;
        }

        final String boardId = optionalBoardId.get();
        final String wsId = UUID.randomUUID().toString();
        UserUtils.getSession(vertx.eventBus(), sessionId, infos -> {
            try {
                if (infos == null) {
                    log.error("[Magneto@CollaborationController::handle] Not authenticated");
                    return;
                }

                final UserInfos session = UserUtils.sessionToUserInfos(infos);
                final String userId = session.getUserId();
                ws.closeHandler(e -> onCloseWSConnection(boardId, userId, wsId));
                onConnect(session, boardId, wsId, ws)
                        .onSuccess(onSuccess -> {
                            ws.resume();
                            ws.frameHandler(frame -> {
                                try {
                                    if (frame.isBinary()) {
                                        log.warn("[Magneto@CollaborationController::handle] Binary is not handled");
                                    }
                                    else if (frame.isText()){
                                        final String message = frame.textData();
                                        final MagnetoUserAction action = Json.decodeValue(message, MagnetoUserAction.class);
                                        this.magnetoCollaborationService.pushEvent(boardId, session, action, wsId, false);
                                    }
                                    else if (frame.isClose()) {
                                        log.debug("[Magneto@CollaborationController::handle] Received a close frame from the user");
                                        onCloseWSConnection(boardId, userId, wsId);
                                    }
                                } catch (Exception e) {
                                    log.error("[Magneto@CollaborationController::handle] An error occured while parsing message:", e);
                                }
                            });
                        })
                        .onFailure(th -> {
                            log.error("[Magneto@CollaborationController::handle] An error occurred while opening the websocket", th);
                        });

            } catch (Exception e) {
                ws.resume();
                log.error("[Magneto@CollaborationController::handle] An error occurred while treating ws", e);
            }
        });
    }

    /**
     * Called when a user arrives at the board -> we create a new WS connection for him, add it to the pool and inform other users of the board
     */
    private Future<Void> onConnect(final UserInfos user, final String boardId, final String wsId, final ServerWebSocket ws) {
        int currentPlatformConnections = wsIdToUser.size();
        int currentBoardConnections = getConnectedUsersCountForBoard(boardIdToWSIdToWS, boardId);
        String connectionLimitsStatus = getConnectionLimitsStatus(boardId, user.getUserId(), currentPlatformConnections,
                currentBoardConnections, maxConnections, maxConnectionsPerBoard, warningThreshold);

        // Si on a dépassé le nombre de connection limite (total ou par board)
        if (!connectionLimitsStatus.equals(OK)) {
            ws.close((short) 1013, connectionLimitsStatus);
            return Future.failedFuture("[Magneto@CollaborationController::onConnect] Maximum connections exceeded");
        }

        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
        wsIdToWs.put(wsId, ws);
        final Promise<Void> promise = Promise.promise();
        this.magnetoCollaborationService.onNewConnection(boardId, user, wsId, wsIdToUser)
                .compose(messages -> broadcastMessagesToUsers(messages, null))
                .onComplete(promise);
        return promise.future();
    }

    /**
     * Called when a user leaves the board -> we remove its WS connection from the pool and inform other users of the board
     */
    protected void onCloseWSConnection(final String boardId, final String userId, final String wsId) {
        this.magnetoCollaborationService.onNewDisconnection(boardId, userId, wsId)
                .compose(messages -> this.broadcastMessagesToUsers(messages, wsId))
                .onComplete(e -> {
                    final Map<String, ServerWebSocket> wss = boardIdToWSIdToWS.get(boardId);
                    if (wss != null) {
                        if (wss.remove(wsId) == null) {
                            log.debug("[Magneto@CollaborationController::onCloseWSConnection] No ws removed");
                        } else {
                            log.debug("[Magneto@CollaborationController::onCloseWSConnection] WS correctly removed");
                        }
                    }
                    wsIdToUser.remove(wsId);
                });
    }

    // Broadcasts / closing

    /**
     * Close all WS connections from the pool
     */
    private void closeConnections() {
        boardIdToWSIdToWS.values().stream().flatMap(e -> e.values().stream()).forEach(ServerWebSocket::close);
        boardIdToWSIdToWS.clear();
        wsIdToUser.clear();
    }

    /**
     * Diffuse les messages externes (provenant de Redis) à tous les utilisateurs locaux
     */
    private Future<Void> broadcastExternalMessagesToUsers(List<MagnetoMessage> messages, String exceptWsId) {
        List<Future> futures = new ArrayList<>();

        for (MagnetoMessage message : messages) {
            final String payload = message.toJson().encode();
            final String boardId = message.getBoardId();
            final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());

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
                                log.debug("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] External message sent for board: " + boardId);
                                writePromise.complete();
                            } else {
                                log.warn("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Failed to send external message", ar.cause());
                                writePromise.fail(ar.cause());
                            }
                        });
                    } catch (Throwable e) {
                        log.warn("[Magneto@CollaborationController::broadcastExternalMessagesToUsers] Exception while writing Redis message to ws", e);
                        writePromise.fail(e);
                    }
                });

                futures.add(writePromise.future());
            }
        }

        if (futures.isEmpty()) {
            return Future.succeededFuture();
        }

        return CompositeFuture.join(futures).mapEmpty();
    }

    /**
     * Gère les messages avec différenciation readOnly/fullAccess
     */
    private Future<Void> broadcastReadOnlyFullAccessMessages(List<MagnetoMessage> messages, String exceptWsId) throws JsonProcessingException {
        // Séparer les messages
        Optional<MagnetoMessage> readOnlyMessage = messages.stream()
                .filter(m -> READONLY.equals(m.getActionId()))
                .findFirst();

        Optional<MagnetoMessage> fullAccessMessage = messages.stream()
                .filter(m -> FULLACCESS.equals(m.getActionId()))
                .findFirst();

        if (!readOnlyMessage.isPresent() || !fullAccessMessage.isPresent()) {
            log.warn("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Missing readOnly or fullAccess message");
            return Future.succeededFuture();
        }

        String boardId = readOnlyMessage.get().getBoardId();
        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());

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
            MagnetoMessage messageToSend = user.getRights().isReadOnly() ? readOnlyMessage.get() : fullAccessMessage.get();
            String payload = messageToSend.toJson().encode();

            Promise<Void> writePromise = Promise.promise();
            vertx.setTimer(1L, p -> {
                try {
                    ws.writeTextMessage(payload, ar -> {
                        if (ar.succeeded()) {
                            writePromise.complete();
                        } else {
                            log.warn("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Failed to send message", ar.cause());
                            writePromise.fail(ar.cause());
                        }
                    });
                } catch (Throwable e) {
                    log.warn("[Magneto@CollaborationController::broadcastReadOnlyFullAccessMessages] Exception while writing message", e);
                    writePromise.fail(e);
                }
            });
            futures.add(writePromise.future());
        }

        if (futures.isEmpty()) {
            return Future.succeededFuture();
        }

        return CompositeFuture.join(futures).mapEmpty();
    }

    /**
     * Gère les messages avec différenciation actualUser/otherUsers
     */
    private Future<Void> broadcastActualUserOtherUsersMessages(List<MagnetoMessage> messages, String exceptWsId) {
        // Séparer les messages
        Optional<MagnetoMessage> actualUserMessage = messages.stream()
                .filter(m -> ACTUALUSER.equals(m.getActionId()))
                .findFirst();

        Optional<MagnetoMessage> otherUsersMessage = messages.stream()
                .filter(m -> OTHERUSERS.equals(m.getActionId()))
                .findFirst();

        if (!actualUserMessage.isPresent() || !otherUsersMessage.isPresent()) {
            log.warn("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Missing actualUser or otherUsers message");
            return Future.succeededFuture();
        }

        String boardId = actualUserMessage.get().getBoardId();
        String actualUserId = actualUserMessage.get().getUserId();
        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());

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

            Promise<Void> writePromise = Promise.promise();
            vertx.setTimer(1L, p -> {
                try {
                    ws.writeTextMessage(payload, ar -> {
                        if (ar.succeeded()) {
                            writePromise.complete();
                        } else {
                            log.warn("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Failed to send message", ar.cause());
                            writePromise.fail(ar.cause());
                        }
                    });
                } catch (Throwable e) {
                    log.warn("[Magneto@CollaborationController::broadcastActualUserOtherUsersMessages] Exception while writing message", e);
                    writePromise.fail(e);
                }
            });
            futures.add(writePromise.future());
        }

        if (futures.isEmpty()) {
            return Future.succeededFuture();
        }

        return CompositeFuture.join(futures).mapEmpty();
    }

    /**
     * Envoie un même message à tous les WS actifs du pool (= tous les users dans le board)
     */
    private Future<Void> broadcastMessagesToUsers(final List<MagnetoMessage> messages, final String exceptWsId) {
        final List<Future> futures = messages.stream()
                .map(message -> {
                    final String payload = message.toJson().encode();
                    final String boardId = message.getBoardId();
                    final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
                    final List<Future> writeMessagesPromise = wsIdToWs.entrySet().stream()
                            .filter(e -> !e.getKey().equals(exceptWsId))
                            .map(Map.Entry::getValue)
                            .filter(ws -> !ws.isClosed())
                            .map(ws -> {
                                final Promise<Void> writeMessagePromise = Promise.promise();
                                vertx.setTimer(1L, p -> {
                                    try {
                                        ws.writeTextMessage(payload, ar -> {
                                            if (ar.succeeded()) {
                                                writeMessagePromise.complete();
                                            } else {
                                                log.warn("[Magneto@CollaborationController::broadcastMessagesToUsers] Failed to send message", ar.cause());
                                                writeMessagePromise.fail(ar.cause());
                                            }
                                        });
                                    }
                                    catch (Throwable e) {
                                        log.warn("[Magneto@CollaborationController::broadcastMessagesToUsers] An exception occurred while writing to ws", e);
                                        writeMessagePromise.fail(e);
                                    }
                                });
                                return writeMessagePromise.future();
                            }).collect(Collectors.toList());
                    return CompositeFuture.join(writeMessagesPromise).mapEmpty();
                })
                .collect(Collectors.toList());
        return CompositeFuture.join(futures).mapEmpty();
    }
}