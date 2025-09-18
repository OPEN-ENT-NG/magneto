package fr.cgi.magneto.realtime;

import io.vertx.core.Future;
import io.vertx.redis.client.RedisConnection;

public class RedisConnectionWrapper {
    RedisConnection connection;

    public Future<Void> close() {
        return connection == null ? Future.succeededFuture() : connection.close().onComplete(e -> this.connection = null);
    }

    public boolean alreadyConnected() {
        return connection != null;
    }
}
