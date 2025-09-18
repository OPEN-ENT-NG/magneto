package fr.cgi.magneto.realtime;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.realtime.events.CollaborationUsersMetadata;
import fr.wseduc.webutils.Utils;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.redis.client.*;

import java.util.*;
import java.util.stream.Collectors;

import static com.google.common.collect.Lists.newArrayList;

public class MagnetoRedisService {
    private static final Logger log = LoggerFactory.getLogger(MagnetoRedisService.class);
    // Redis configuration
    private static final String channelName = "__realtime@magneto";
    private static final String metadataCollectionPrefix = "rt_magneto_context_";
    private final Vertx vertx;
    private final JsonObject config;
    private final String serverId;
    private final long reConnectionDelay;
    private final long publishPeriodInMs;
    private final RedisConnectionWrapper subscriberConnection = new RedisConnectionWrapper();
    // Context management
    private final Map<String, CollaborationUsersMetadata> metadataByBoardId;
    // Status and message handlers
    private final List<Handler<RealTimeStatus>> statusSubscribers;
    private final List<Handler<MagnetoMessage>> messageHandlers;
    // Redis connections
    private RedisAPI redisPublisher;
    private long restartAttempt = 0;
    private long contextPublisherId = -1;

    public MagnetoRedisService(Vertx vertx, JsonObject config, String serverId,
                               Map<String, CollaborationUsersMetadata> metadataByBoardId) {
        this.vertx = vertx;
        this.config = config;
        this.serverId = serverId;
        this.metadataByBoardId = metadataByBoardId;
        this.reConnectionDelay = config.getLong(Field.RECONNECTION_DELAY_IN_MS, 1000L);
        this.publishPeriodInMs = config.getLong(Field.PUBLISH_CONTEXT_PERIOD_IN_MS, 60000L);
        this.statusSubscribers = new ArrayList<>();
        this.messageHandlers = new ArrayList<>();
    }

    /**
     * Démarre le service Redis : connexion, souscription au channel et boucle de publication
     */
    public Future<Void> start() {
        try {
            final RedisOptions redisOptions = getRedisOptions(vertx, config);
            final Redis publisherClient = Redis.createClient(vertx, redisOptions);
            redisPublisher = RedisAPI.api(publisherClient);

            return listenToRedis()
                    .onSuccess(e -> publishContextLoop());
        } catch (Exception e) {
            return Future.failedFuture(e);
        }
    }

    /**
     * Arrête le service Redis
     */
    public Future<Void> stop() {
        if (this.contextPublisherId >= 0) {
            vertx.cancelTimer(this.contextPublisherId);
            this.contextPublisherId = -1;
        }
        return closeAndClean().onComplete(e -> this.statusSubscribers.clear());
    }

    /**
     * Établit la connexion d'écoute Redis
     */
    private Future<Void> listenToRedis() {
        final Promise<Void> promise = Promise.promise();
        if (subscriberConnection.alreadyConnected()) {
            promise.complete();
        } else {
            log.info("[Magneto@MagnetoRedisService::listenToRedis] Connecting to Redis....");
            Redis.createClient(vertx, getRedisOptions(vertx, config))
                    .connect(onConnect -> {
                        if (onConnect.succeeded()) {
                            log.info("[Magneto@MagnetoRedisService::listenToRedis] Connection to redis established");
                            this.restartAttempt = 0;
                            promise.complete();
                            RedisConnection client = onConnect.result();
                            subscriberConnection.connection = client;

                            client.handler(message -> {
                                try {
                                    if (Field.MESSAGE.equals(message.get(0).toString())) {
                                        String receivedMessage = message.get(2).toString();
                                        this.onNewRedisMessage(receivedMessage);
                                    }
                                } catch (Exception e) {
                                    log.error("[Magneto@MagnetoRedisService::listenToRedis] Cannot treat Redis message " + message, e);
                                }
                            }).exceptionHandler(t -> {
                                log.error("[Magneto@MagnetoRedisService::listenToRedis] Lost connection to redis", t);
                                this.listenToRedis();
                            }).send(Request.cmd(Command.SUBSCRIBE).arg(channelName), subscribeResult -> {
                                if (subscribeResult.succeeded()) {
                                    log.info("[Magneto@MagnetoRedisService::listenToRedis] Subscribed to channel " + channelName + " successfully!");
                                } else {
                                    log.error("[Magneto@MagnetoRedisService::listenToRedis] Failed to subscribe: " + subscribeResult.cause());
                                }
                            });
                        } else {
                            this.onRedisConnectionStopped(onConnect.cause()).onComplete(promise);
                        }
                    });
        }
        return promise.future();
    }

    /**
     * Publie un message sur Redis pour notifier les autres instances
     */
    public Future<Void> publishMessage(MagnetoMessage message) {
        return publishMessagesOnRedis(Collections.singletonList(message));
    }

    /**
     * Publie plusieurs messages sur Redis séquentiellement
     */
    public Future<Void> publishMessages(List<MagnetoMessage> messages) {
        return publishMessagesOnRedis(messages);
    }

    /**
     * Publie les métadonnées d'un board spécifique
     */
    public Future<Void> publishBoardMetadata(String boardId) {
        final Promise<Void> promise = Promise.promise();
        final CollaborationUsersMetadata metadata = metadataByBoardId.get(boardId);
        if (metadata == null) {
            promise.complete();
            return promise.future();
        }

        log.debug("[Magneto@MagnetoRedisService::publishBoardMetadata] Publishing board metadata to Redis for board: " + boardId);
        final JsonObject payload = new JsonObject()
                .put(boardId, JsonObject.mapFrom(metadata));

        redisPublisher.set(newArrayList(
                metadataCollectionPrefix + serverId + "_" + boardId,
                payload.encode(),
                "PX",
                String.valueOf(2 * publishPeriodInMs)
        ), onPublishDone -> {
            if (onPublishDone.succeeded()) {
                promise.complete();
            } else {
                log.error("[Magneto@MagnetoRedisService::publishBoardMetadata] Cannot publish board metadata to Redis for board: " + boardId);
                notifyStatusChange(RealTimeStatus.ERROR);
                promise.fail(onPublishDone.cause());
            }
        });
        return promise.future();
    }

    /**
     * Récupère les métadonnées d'un board depuis Redis (fusion de toutes les instances)
     */
    public Future<CollaborationUsersMetadata> getBoardMetadata(String boardId) {
        final Promise<CollaborationUsersMetadata> promise = Promise.promise();

        this.redisPublisher.keys(metadataCollectionPrefix + "*_" + boardId, e -> {
            if (e.succeeded()) {
                final List<String> keys = e.result().stream()
                        .map(Response::toString)
                        .filter(key -> !key.endsWith(serverId + "_" + boardId))
                        .distinct()
                        .collect(Collectors.toList());

                getOtherInstancesMetadata(boardId, keys).onComplete(promise);
            } else {
                log.error("[Magneto@MagnetoRedisService::getBoardMetadata] Cannot get context keys for board: " + boardId);
                promise.fail(e.cause());
            }
        });

        return promise.future().onFailure(th -> notifyStatusChange(RealTimeStatus.ERROR));
    }

    /**
     * Subscribe aux changements de statut
     */
    public void subscribeToStatusChanges(Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.add(subscriber);
    }

    /**
     * Unsubscribe aux changements de statut
     */
    public void unsubscribeToStatusChanges(Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.remove(subscriber);
    }

    /**
     * Subscribe aux messages Redis entrants
     */
    public void subscribeToMessages(Handler<MagnetoMessage> handler) {
        this.messageHandlers.add(handler);
    }

    /**
     * Traite un nouveau message reçu de Redis
     */
    private void onNewRedisMessage(String payload) {
        log.debug("[Magneto@MagnetoRedisService::onNewRedisMessage] Received message: " + payload);
        try {
            final MagnetoMessage message = Json.decodeValue(payload, MagnetoMessage.class);
            if (!serverId.equals(message.getEmittedBy())) {
                // Notifier tous les handlers du message reçu
                for (Handler<MagnetoMessage> handler : messageHandlers) {
                    try {
                        handler.handle(message);
                    } catch (Exception e) {
                        log.error("[Magneto@MagnetoRedisService::onNewRedisMessage] Error in message handler", e);
                    }
                }
            }
        } catch (Exception e) {
            log.error("[Magneto@MagnetoRedisService::onNewRedisMessage] Error processing Redis message", e);
        }
    }

    /**
     * Publication périodique des métadonnées de tous les boards
     */
    private Future<Void> publishContextLoop() {
        final Promise<Void> promise = Promise.promise();
        if (contextPublisherId >= 0) {
            promise.complete();
        } else {
            this.contextPublisherId = vertx.setPeriodic(publishPeriodInMs, timerId -> {
                publishAllMetadata();
            });
            promise.complete();
        }
        return promise.future();
    }

    /**
     * Publie les métadonnées de tous les boards actifs
     */
    private Future<Void> publishAllMetadata() {
        final Promise<Void> promise = Promise.promise();
        log.debug("[Magneto@MagnetoRedisService::publishAllMetadata] Publishing all contexts to Redis...");

        if (metadataByBoardId.isEmpty()) {
            promise.complete();
            return promise.future();
        }

        final String payload = Json.encode(metadataByBoardId);
        redisPublisher.set(newArrayList(
                metadataCollectionPrefix + serverId,
                payload,
                "PX",
                String.valueOf(2 * publishPeriodInMs)
        ), onPublishDone -> {
            if (onPublishDone.succeeded()) {
                promise.complete();
            } else {
                log.error("[Magneto@MagnetoRedisService::publishAllMetadata] Cannot publish all contexts to Redis");
                notifyStatusChange(RealTimeStatus.ERROR);
                promise.fail(onPublishDone.cause());
            }
        });
        return promise.future();
    }

    /**
     * Publication séquentielle des messages sur Redis
     */
    private Future<Void> publishMessagesOnRedis(List<MagnetoMessage> messages) {
        return publishMessagesOnRedis(messages, 0)
                .onSuccess(e -> log.debug("[Magneto@MagnetoRedisService::publishMessagesOnRedis] " + messages.size() + " messages published on redis"));
    }

    /**
     * Publication récursive des messages à partir d'un index
     */
    private Future<Void> publishMessagesOnRedis(List<MagnetoMessage> messages, int index) {
        final Promise<Void> promise = Promise.promise();
        if (messages == null || messages.size() <= index) {
            promise.complete();
        } else {
            final String payload = Json.encode(messages.get(index));
            redisPublisher.publish(channelName, payload, e -> {
                if (e.succeeded()) {
                    publishMessagesOnRedis(messages, index + 1).onComplete(promise);
                } else {
                    log.error("[Magneto@MagnetoRedisService::publishMessagesOnRedis] Error publishing message: " + payload, e.cause());
                    promise.fail(e.cause());
                }
            });
        }
        return promise.future();
    }

    /**
     * Récupère les métadonnées des autres instances Redis
     */
    private Future<CollaborationUsersMetadata> getOtherInstancesMetadata(String boardId, List<String> keys) {
        final Promise<CollaborationUsersMetadata> promise = Promise.promise();
        if (keys.isEmpty()) {
            // Retourner les métadonnées locales uniquement
            CollaborationUsersMetadata localMetadata = metadataByBoardId.get(boardId);
            promise.complete(localMetadata != null ? localMetadata : new CollaborationUsersMetadata());
        } else {
            this.redisPublisher.mget(keys, entriesResponse -> {
                if (entriesResponse.succeeded()) {
                    final CollaborationUsersMetadata otherInstancesMetadata = entriesResponse.result().stream()
                            .map(entry -> new JsonObject(entry.toString()))
                            .map(entry -> entry.getJsonObject(boardId))
                            .filter(Objects::nonNull)
                            .map(rawContext -> rawContext.mapTo(CollaborationUsersMetadata.class))
                            .reduce(CollaborationUsersMetadata::merge)
                            .orElseGet(CollaborationUsersMetadata::new);

                    final CollaborationUsersMetadata localMetadata = metadataByBoardId.computeIfAbsent(
                            boardId, k -> new CollaborationUsersMetadata());

                    promise.complete(CollaborationUsersMetadata.merge(localMetadata, otherInstancesMetadata));
                } else {
                    log.error("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Cannot get metadata values for board: " + boardId, entriesResponse.cause());
                    promise.fail(entriesResponse.cause());
                }
            });
        }
        return promise.future();
    }

    /**
     * Gestion de la perte de connexion Redis
     */
    private Future<Void> onRedisConnectionStopped(Throwable cause) {
        log.error("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Error while subscribing to " + channelName, cause);
        notifyStatusChange(RealTimeStatus.ERROR);
        this.restartAttempt++;
        final long factor = Math.max(0L, restartAttempt - 1);
        final Promise<Void> promise = Promise.promise();

        vertx.setTimer((long) (reConnectionDelay * Math.pow(2, factor)), e -> {
            log.info("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Trying to reconnect to Redis (attempt " + restartAttempt + ")...");
            start().onComplete(promise);
        });
        return promise.future();
    }

    /**
     * Notifie les subscribers d'un changement de statut
     */
    private void notifyStatusChange(RealTimeStatus status) {
        for (Handler<RealTimeStatus> subscriber : statusSubscribers) {
            try {
                subscriber.handle(status);
            } catch (Exception e) {
                log.error("[Magneto@MagnetoRedisService::notifyStatusChange] Error in status subscriber", e);
            }
        }
    }

    /**
     * Ferme les connexions Redis
     */
    private Future<Void> closeAndClean() {
        try {
            subscriberConnection.close();
        } catch (Exception e) {
            log.error("[Magneto@MagnetoRedisService::closeAndClean] Cannot close redis subscriber", e);
        }
        try {
            if (redisPublisher != null) {
                redisPublisher.close();
            }
        } catch (Exception e) {
            log.error("[Magneto@MagnetoRedisService::closeAndClean] Cannot close redis publisher", e);
        }
        return Future.succeededFuture();
    }

    /**
     * Configuration des options Redis
     */
    private RedisOptions getRedisOptions(Vertx vertx, JsonObject conf) {
        JsonObject redisConfig = conf.getJsonObject(Field.REDISCONFIG);

        if (redisConfig == null) {
            final String redisConf = (String) vertx.sharedData().getLocalMap(Field.SERVER).get(Field.REDISCONFIG);
            if (redisConf == null) {
                throw new IllegalStateException("missing.redis.config");
            } else {
                redisConfig = new JsonObject(redisConf);
            }
        }

        String redisConnectionString = redisConfig.getString(Field.CONNECTION_STRING);
        if (Utils.isEmpty(redisConnectionString)) {
            redisConnectionString =
                    "redis://" + (redisConfig.containsKey(Field.AUTH) ? ":" + redisConfig.getString(Field.AUTH) + "@" : "") +
                            redisConfig.getString(Field.HOST) + ":" + redisConfig.getInteger(Field.PORT) + "/" +
                            redisConfig.getInteger(Field.SELECT, 0);
        }

        return new RedisOptions()
                .setConnectionString(redisConnectionString)
                .setMaxPoolSize(redisConfig.getInteger(Field.POOL_SIZE, 32))
                .setMaxWaitingHandlers(redisConfig.getInteger(Field.MAXWAITINGHANDLERS, 100))
                .setMaxPoolWaiting(redisConfig.getInteger(Field.MAXPOOLWAITING, 100));
    }

    /**
     * Wrapper pour la connexion Redis subscriber
     */
    private static class RedisConnectionWrapper {
        RedisConnection connection;

        public Future<Void> close() {
            return connection == null ? Future.succeededFuture() : connection.close().onComplete(e -> this.connection = null);
        }

        public boolean alreadyConnected() {
            return connection != null;
        }
    }
}