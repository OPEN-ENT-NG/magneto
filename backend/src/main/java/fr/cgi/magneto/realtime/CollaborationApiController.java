package fr.cgi.magneto.realtime;

import io.vertx.core.json.Json;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.web.RoutingContext;

import java.math.BigDecimal;

public class CollaborationApiController {

    private final Logger logger = LoggerFactory.getLogger(CollaborationApiController.class);

    private final CollaborationRepostiory repository;

    public CollaborationApiController(CollaborationRepostiory repository) {
        this.repository = repository;
    }

    public void handleGetAuction(RoutingContext context) {
        String auctionId = context.request().getParam("id");
        this.repository.getById(auctionId).onSuccess(auction -> {
            if (auction.isPresent()) {
                context.vertx().eventBus().publish("collaboration." + auctionId, Json.encodePrettily(auction.get()));
                context.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(200)
                    .end(Json.encodePrettily(auction.get()));
            } else {
                context.response()
                    .putHeader("content-type", "application/json")
                    .setStatusCode(404)
                    .end();
            }
        }).onFailure(th -> {
            logger.error("An error occurred while getting auction id", th);
            context.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(500)
                .end();
        });
    }

    public void handleChangeAuctionPrice(RoutingContext context) {
        String auctionId = context.request().getParam("id");
        Collaboration auctionRequest = new Collaboration(
            auctionId,
            new BigDecimal(context.getBodyAsJson().getString("price"))
        );

        this.repository.save(auctionRequest);
        context.vertx().eventBus().publish("collaboration." + auctionId, context.getBodyAsString());

        context.response()
                .setStatusCode(200)
                .end();
    }

    public void initAuctionInSharedData(RoutingContext context) {
        String auctionId = context.request().getParam("id");

        this.repository.getById(auctionId).onSuccess(auction -> {
            if(!auction.isPresent()) {
                this.repository.save(new Collaboration(auctionId));
            }
            context.next();
        }).onFailure(th -> {
            logger.error("An error occurred while initializing auction in shared data", th);
            context.response()
                .putHeader("content-type", "application/json")
                .setStatusCode(500)
                .end();
        });
    }
}
