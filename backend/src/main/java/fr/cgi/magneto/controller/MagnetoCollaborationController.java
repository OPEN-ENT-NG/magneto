package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.helper.MagnetoMessage;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import fr.cgi.magneto.service.ServiceFactory;
import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
        clients.add(ws);

        // Log la connexion
        log.info("Client connected: " + ws.remoteAddress());

        // Gestion de la fermeture propre
        ws.closeHandler(v -> {
            clients.remove(ws);
            log.info("Client disconnected: " + ws.remoteAddress());
        });

        ws.frameHandler(frame -> {
            if (frame.isText()) {
                String message = frame.textData();
                log.info("Receiving: " + message);

                // Broadcast à tous les autres clients
                clients.forEach(client -> {
                    if (client != ws && !client.isClosed()) {
                        client.writeTextMessage(message);
                    }
                });
            } else {
                log.warn("Non-text frame received");
            }
        });
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