package fr.cgi.magneto.controller;

import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class MagnetoCollaborationController implements Handler<ServerWebSocket> {

    private final Vertx vertx;
    private static final Logger log = LoggerFactory.getLogger(MagnetoCollaborationController.class);


    public MagnetoCollaborationController(final Vertx vertx) {
        this.vertx = vertx;
    }

    @Override
    public void handle(ServerWebSocket ws) {
        ws.frameHandler(frame -> {
            try {
                if (frame.isText()){
                    log.info("Receiving: " + frame.textData());
                    final String message = frame.textData();
                    // push events to everyone
                    ws.writeTextMessage(message);
                } else {
                    log.error("Not receiving anything");
                }
            } catch (Exception e) {
                log.error("An error occured while parsing message:", e);
            }
        });
    }
}
