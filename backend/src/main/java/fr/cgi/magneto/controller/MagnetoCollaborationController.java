package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.core.events.MagnetoUserAction;
import fr.cgi.magneto.helper.MagnetoMessage;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.webutils.request.CookieHelper;
import fr.wseduc.webutils.request.filter.UserAuthFilter;
import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

public class MagnetoCollaborationController implements Handler<ServerWebSocket> {

    private static final Logger log = LoggerFactory.getLogger(MagnetoCollaborationController.class);
    private final Map<String, Map<String, ServerWebSocket>> boardIdToWSIdToWS = new HashMap<>();
    private final Vertx vertx;
    private final List<ServerWebSocket> clients = new ArrayList<>();
    private final MagnetoCollaborationService magnetoCollaborationService;
    private final int maxConnections;

    public MagnetoCollaborationController(ServiceFactory serviceFactory, int maxConnections, JsonObject config) {
        this.vertx = serviceFactory.vertx();
        this.magnetoCollaborationService = serviceFactory.magnetoCollaborationService();
        this.magnetoCollaborationService.subscribeToStatusChanges(newStatus -> {
            if (RealTimeStatus.ERROR.equals(newStatus) || RealTimeStatus.STOPPED.equals(newStatus)) {
                this.closeConnections();
            }
        });
        this.magnetoCollaborationService.subscribeToNewMessagesToSend(messages -> {
            if (messages.isNotEmpty()) {
                this.broadcastMessagesToUsers(messages.getMessages(), messages.getExceptWSId());
            }
        });
        this.maxConnections = maxConnections;
    }

    @Override
    public void handle(ServerWebSocket ws) {

        ws.pause();
        log.info("Handle websocket");
        final String sessionId = CookieHelper.getInstance().getSigned(UserAuthFilter.SESSION_ID, ws);
        final Optional<String> maybeBoardId = getBoardId(ws.path());
        if (!maybeBoardId.isPresent()) {
            log.error("No board id");
            return;
        }
        final String boardId = maybeBoardId.get();
        final String wsId = UUID.randomUUID().toString();
        UserUtils.getSession(vertx.eventBus(), sessionId, infos -> {
            try {
                if (infos == null) {
                    log.error("Not authenticated");
                    return;
                }
                final UserInfos session = UserUtils.sessionToUserInfos(infos);
                //TODO : check l'accès au tableau si necessaire

                final String userId = session.getUserId();
                ws.closeHandler(e -> onCloseWSConnection(boardId, wsId));
                onConnect(session, boardId, wsId, ws).onSuccess(onSuccess -> {
                    ws.resume();
                    ws.frameHandler(frame -> {
                        try {

                            if (frame.isBinary()) {
                                log.warn("Binary is not handled");
                            } else if(frame.isText()){
                                final String message = frame.textData();
                                final MagnetoUserAction action = Json.decodeValue(message, MagnetoUserAction.class);
                                this.magnetoCollaborationService.pushEvent(boardId, session, action, wsId, false);//.onFailure(th -> this.sendError(th, ws));
                            } else if(frame.isClose()) {
                                log.debug("Received a close frame from the user");
                                onCloseWSConnection(boardId, wsId);
                            }
                        } catch (Exception e) {
                            log.error("An error occured while parsing message:", e);
                        }
                    });
                }).onFailure(th -> {
                    log.error("An error occurred while opening the websocket", th);
                });

            } catch (Exception e) {
                ws.resume();
                log.error("An error occurred while treating ws", e);
            }
        });

    }

    private Optional<String> getBoardId(String path) {
        final String[] splitted = path.split("/");
        if (splitted.length > 0) {
            return Optional.of(splitted[splitted.length - 1].trim().toLowerCase());
        }
        return Optional.empty();
    }

    protected void onCloseWSConnection(final String wallId, final String wsId) {
        final Map<String, ServerWebSocket> wss = boardIdToWSIdToWS.get(wallId);
        if (wss != null) {
            if (wss.remove(wsId) == null) {
                log.debug("No ws removed");
            } else {
                log.debug("WS correctly removed");
            }
        }
    }

    private Future<Void> onConnect(final UserInfos user, final String boardId, final String wsId, final ServerWebSocket ws) {
        final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
        wsIdToWs.put(wsId, ws);
        final Promise<Void> promise = Promise.promise();
        this.magnetoCollaborationService.onNewConnection(boardId, user, wsId)
                .compose(messages -> broadcastMessagesToUsers(messages, null))
                .onComplete(promise);
        return promise.future();
    }

    private Future<Void> broadcastMessagesToUsers(final List<MagnetoMessage> messages,
                                                  final String exceptWsId) {
        final List<Future<Object>> futures = messages.stream().map(message -> {
            final String payload = Json.encode(message);
            final String boardId = message.getBoardId();
            final Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.computeIfAbsent(boardId, k -> new HashMap<>());
            final List<Future<Void>> writeMessagesPromise = wsIdToWs.entrySet().stream()
                    .filter(e -> !e.getKey().equals(exceptWsId))
                    .map(Map.Entry::getValue)
                    .filter(ws -> !ws.isClosed())
                    .map(ws -> {
                        final Promise<Void> writeMessagePromise = Promise.promise();
                        Future<Void> sent;
                        vertx.setTimer(1L, p -> {
                            try {
                                ws.writeTextMessage(payload, writeMessagePromise);
                                writeMessagePromise.future();
                            } catch (Throwable e) {
                                log.warn("An exception occurred while writing to ws", e);
                            }
                        });
                        sent = Future.succeededFuture();
                        return sent;
                    }).collect(Collectors.toList());
            return CompositeFuture.join((List) writeMessagesPromise).mapEmpty();
        }).collect(Collectors.toList());
        return CompositeFuture.join((List) futures).mapEmpty();
    }

    private void closeConnections() {
        boardIdToWSIdToWS.values().stream().flatMap(e -> e.values().stream()).forEach(ServerWebSocket::close);
        boardIdToWSIdToWS.clear();
    }
}