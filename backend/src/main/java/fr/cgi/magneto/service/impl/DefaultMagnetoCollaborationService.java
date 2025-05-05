package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.helper.MagnetoMessageWrapper;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.webutils.Utils;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.redis.client.Redis;
import io.vertx.redis.client.RedisAPI;
import io.vertx.redis.client.RedisConnection;
import io.vertx.redis.client.RedisOptions;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static io.vertx.core.http.impl.HttpClientConnection.log;

public class DefaultMagnetoCollaborationService implements MagnetoCollaborationService {

    private final Vertx vertx;
    private final JsonObject config;
    private final String serverId;
    private final long reConnectionDelay;
    private final long publishPeriodInMs;
    private final long maxConnectedUser;
    private final List<Handler<RealTimeStatus>> statusSubscribers;
    private final List<Handler<MagnetoMessageWrapper>> messagesSubscribers;
    private final RedisConnectionWrapper subscriberConnection = new RedisConnectionWrapper();
    private final ServiceFactory serviceFactory;
    private long restartAttempt = 0;
    private RedisAPI redisPublisher;
    private RealTimeStatus realTimeStatus;

    public DefaultMagnetoCollaborationService(Vertx vertx, final JsonObject config, ServiceFactory serviceFactory) {
        this.vertx = vertx;
        this.config = config;
        this.serviceFactory = serviceFactory;
        this.realTimeStatus = RealTimeStatus.STOPPED;
        this.serverId = UUID.randomUUID().toString();
        this.messageFactory = new CollaborativeMessageFactory(serverId); //Do we make a factory?
        this.statusSubscribers = new ArrayList<>();
        this.messagesSubscribers = new ArrayList<>();
        this.reConnectionDelay = config.getLong("reconnection-delay-in-ms", 1000L);
        this.publishPeriodInMs = config.getLong("publish-context-period-in-ms", 60000L);
        this.maxConnectedUser = config.getLong("max-connected-user", 50L);
    }

    @Override
    public Future<Void> start() {
        Future<Void> future;
        if (RealTimeStatus.STARTED.equals(this.realTimeStatus) || RealTimeStatus.LIMIT.equals(this.realTimeStatus)) {
            future = Future.failedFuture(this.realTimeStatus + ".cannot.be.started");
        } else {
            changeRealTimeStatus(RealTimeStatus.STARTING);
            try {
                final RedisOptions redisOptions = getRedisOptions(vertx, config);
                final Redis publisherClient = Redis.createClient(vertx, redisOptions);
                redisPublisher = RedisAPI.api(publisherClient);
                future = listenToRedis();
                future.onSuccess(e -> publishContextLoop());
            } catch (Exception e) {
                future = Future.failedFuture(e);
            }
        }
        return future;
    }

    @Override
    public void subscribeToStatusChanges(final Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.add(subscriber);
    }

    @Override
    public void unsubscribeToStatusChanges(final Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.remove(subscriber);
    }

    @Override
    public void subscribeToNewMessagesToSend(Handler<MagnetoMessageWrapper> messagesHandler) {
        this.messagesSubscribers.add(messagesHandler);
    }

    private Future<Void> listenToRedis() {
        final Promise<Void> promise = Promise.promise();
        if(subscriberConnection.alreadyConnected()) {
            promise.complete();
        } else {
            log.info("Connecting to Redis....");
            Redis.createClient(vertx, getRedisOptions(vertx, config))
                    .connect(onConnect -> {
                        if (onConnect.succeeded()) {
                            log.info(".... connection to redis established");
                            changeRealTimeStatus(RealTimeStatus.STARTED);
                            this.restartAttempt = 0;
                            promise.complete();
                            RedisConnection client = onConnect.result();
                            subscriberConnection.connection = client;
                            client.handler(message -> {
                                try {
                                    if ("message".equals(message.get(0).toString())) {
                                        String receivedMessage = message.get(2).toString();
                                        this.onNewRedisMessage(receivedMessage);
                                    }
                                } catch (Exception e) {
                                    log.error("Cannot treat Redis message " + message, e);
                                }
                            }).exceptionHandler(t -> {
                                log.error("Lost connection to redis", t);
                                this.listenToRedis();
                            }).send(Request.cmd(Command.SUBSCRIBE).arg(channelName), subscribeResult -> {
                                if (subscribeResult.succeeded()) {
                                    log.equals("Subscribed to channel " + channelName + " successfully!");
                                } else {
                                    log.error("Failed to subscribe: " + subscribeResult.cause());
                                }
                            });
                        } else {
                            this.onRedisConnectionStopped(onConnect.cause()).onComplete(promise);
                        }
                    });
        }
        return promise.future();
    }

    private RedisOptions getRedisOptions(Vertx vertx, JsonObject conf) {
        JsonObject redisConfig = conf.getJsonObject("redisConfig");

        if (redisConfig == null) {
            final String redisConf = (String) vertx.sharedData().getLocalMap("server").get("redisConfig");
            if (redisConf == null) {
                throw new IllegalStateException("missing.redis.config");
            } else {
                redisConfig = new JsonObject(redisConf);
            }
        }
        String redisConnectionString = redisConfig.getString("connection-string");
        if (Utils.isEmpty(redisConnectionString)) {
            redisConnectionString =
                    "redis://" + (redisConfig.containsKey("auth") ? ":" + redisConfig.getString("auth") + "@" : "") +
                            redisConfig.getString("host") + ":" + redisConfig.getInteger("port") + "/" +
                            redisConfig.getInteger("select", 0);
        }
        return new RedisOptions()
                .setConnectionString(redisConnectionString)
                .setMaxPoolSize(redisConfig.getInteger("pool-size", 32))
                .setMaxWaitingHandlers(redisConfig.getInteger("maxWaitingHandlers", 100))
                .setMaxPoolWaiting(redisConfig.getInteger("maxPoolWaiting", 100));
    }

    private Future<Void> changeRealTimeStatus(RealTimeStatus realTimeStatus) {
        final Promise<Void> promise = Promise.promise();
        if (realTimeStatus == this.realTimeStatus) {
            promise.complete();
        } else {
            //log.debug("Changing real time status : " + this.realTimeStatus + " -> " + realTimeStatus);
            this.realTimeStatus = realTimeStatus;
            final Future<Void> cleanPromise;
            if (realTimeStatus == RealTimeStatus.ERROR) {
                cleanPromise = closeAndClean();
            } else {
                cleanPromise = Future.succeededFuture();
            }
            cleanPromise.onComplete(e -> {
                for (Handler<RealTimeStatus> statusSubscriber : this.statusSubscribers) {
                    try {
                        statusSubscriber.handle(this.realTimeStatus);
                    } catch (Exception exc) {
                        //log.error("Error occurred while calling status change handler", exc);
                    }
                }
                promise.complete();
            });
        }
        return promise.future();
    }

    private Future<Void> closeAndClean() {
        try {
            subscriberConnection.close();
        } catch (Exception e) {
            log.error("Cannot close redis subscriber", e);
        }
        try {
            redisPublisher.close();
        } catch (Exception e) {
            log.error("Cannot close redis publisher", e);
        }
        return Future.succeededFuture();
    }

}
