package fr.cgi.magneto.controller;

import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import java.util.ArrayList;
import java.util.List;

public class MagnetoCollaborationController implements Handler<ServerWebSocket> {

    private final Vertx vertx;
    private static final Logger log = LoggerFactory.getLogger(MagnetoCollaborationController.class);

    private final List<ServerWebSocket> clients = new ArrayList<>();

    public MagnetoCollaborationController(final Vertx vertx) {
        this.vertx = vertx;
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
