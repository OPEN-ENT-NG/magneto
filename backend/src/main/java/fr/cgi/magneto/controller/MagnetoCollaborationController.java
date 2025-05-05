package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class MagnetoCollaborationController implements Handler<ServerWebSocket> {

    private static final Logger log = LoggerFactory.getLogger(MagnetoCollaborationController.class);
    private final Vertx vertx;
    private final List<ServerWebSocket> clients = new ArrayList<>();
    private final MagnetoCollaborationService magnetoCollaborationService;
    private final int maxConnections;

    public MagnetoCollaborationController(final Vertx vertx, final MagnetoCollaborationService magnetoCollaborationService,
                                          final int maxConnections) {
        this.vertx = vertx;
        this.magnetoCollaborationService = magnetoCollaborationService;
        this.magnetoCollaborationService.subscribeToStatusChanges(newStatus -> {
            if (RealTimeStatus.ERROR.equals(newStatus) || RealTimeStatus.STOPPED.equals(newStatus)) {
                this.closeConnections();
            }
        });
        this.magnetoCollaborationService.subscribeToNewMessagesToSend(messages -> {
            if (messages.isNotEmpty()) {
                this.broadcastMessagesToUsers(messages.getMessages(), messages.isAllowInternal(), messages.isAllowExternal(), messages.getExceptWSId());
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
}