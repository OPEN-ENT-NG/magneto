package fr.cgi.magneto.realtime;

import io.vertx.core.Future;
import io.vertx.core.shareddata.AsyncMap;
import io.vertx.core.shareddata.SharedData;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;

public class CollaborationRepostiory {

    private SharedData sharedData;

    public CollaborationRepostiory(SharedData sharedData) {
        this.sharedData = sharedData;
    }

    public Future<Optional<Collaboration>> getById(String auctionId) {
        return this.sharedData.<String, String>getAsyncMap(auctionId)
        .compose(this::convertToAuction);
    }

    public Future<Void> save(Collaboration auction) {
        return this.sharedData.getAsyncMap(auction.getId())
        .compose(map -> 
            Future.all(map.put("id", auction.getId()), map.put("price", auction.getPrice().toString()))
        )
        .mapEmpty();
    }

    private Future<Optional<Collaboration>> convertToAuction(AsyncMap<String, String> auction) {
        final List<Future<?>> futures = new ArrayList<>();
        futures.add(auction.get("id"));
        futures.add(auction.get("price")
                            .map(p -> StringUtils.isBlank(p) ? null : new BigDecimal(p)));
        return Future.all(futures).map(results -> {
            final String id =results.resultAt(0);
            final BigDecimal price = results.resultAt(1);
            final Optional<Collaboration> maybeCollab;
            if(StringUtils.isBlank(id) || price == null) {
                maybeCollab = Optional.empty();
            } else {
                maybeCollab = Optional.of(new Collaboration(id, price));
            }
            return maybeCollab;
    });
    }
}
