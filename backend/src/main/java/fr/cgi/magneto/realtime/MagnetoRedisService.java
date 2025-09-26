package fr.cgi.magneto.realtime;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
    private final List<Handler<MagnetoMessageWrapper>> messageHandlers;
    // Redis connections
    private RedisAPI redisPublisher;
    private long restartAttempt = 0;
    private long contextPublisherId = -1;

    public MagnetoRedisService(Vertx vertx, JsonObject config, String serverId,
                               Map<String, CollaborationUsersMetadata> metadataByBoardId,
                               List<Handler<RealTimeStatus>> statusSubscribers,
                               List<Handler<MagnetoMessageWrapper>> messageHandlers) {
        log.info("[Magneto@MagnetoRedisService] Initializing MagnetoRedisService for serverId: " + serverId);
        this.vertx = vertx;
        this.config = config;
        this.serverId = serverId;
        this.metadataByBoardId = metadataByBoardId;
        this.reConnectionDelay = config.getLong(Field.RECONNECTION_DELAY_IN_MS, 1000L);
        this.publishPeriodInMs = config.getLong(Field.PUBLISH_CONTEXT_PERIOD_IN_MS, 60000L);
        this.statusSubscribers = statusSubscribers;
        this.messageHandlers = messageHandlers;

        log.info("[Magneto@MagnetoRedisService] Configuration - reConnectionDelay: " + reConnectionDelay +
                "ms, publishPeriod: " + publishPeriodInMs + "ms, channelName: " + channelName);
    }

    /**
     * Démarre le service Redis : connexion, souscription au channel et boucle de publication
     */
    public Future<Void> start() {
        log.info("[Magneto@MagnetoRedisService::start] Starting Redis service");
        final long startTime = System.currentTimeMillis();

        try {
            final RedisOptions redisOptions = getRedisOptions(vertx, config);
            log.info("[Magneto@MagnetoRedisService::start] Redis options configured - connection string: " +
                    redisOptions);

            final Redis publisherClient = Redis.createClient(vertx, redisOptions);
            redisPublisher = RedisAPI.api(publisherClient);
            log.info("[Magneto@MagnetoRedisService::start] Redis publisher client created");

            return listenToRedis()
                    .onSuccess(e -> {
                        final long duration = System.currentTimeMillis() - startTime;
                        log.info("[Magneto@MagnetoRedisService::start] Redis listener established in " + duration + "ms - starting context publish loop");
                        publishContextLoop();
                    })
                    .onFailure(err -> {
                        final long duration = System.currentTimeMillis() - startTime;
                        log.error("[Magneto@MagnetoRedisService::start] Failed to start Redis service in " + duration + "ms", err);
                    });
        } catch (Exception e) {
            log.error("[Magneto@MagnetoRedisService::start] Exception during Redis service startup", e);
            return Future.failedFuture(e);
        }
    }

    /**
     * Arrête le service Redis
     */
    public Future<Void> stop() {
        log.info("[Magneto@MagnetoRedisService::stop] Stopping Redis service");

        if (this.contextPublisherId >= 0) {
            log.info("[Magneto@MagnetoRedisService::stop] Cancelling context publisher timer: " + contextPublisherId);
            vertx.cancelTimer(this.contextPublisherId);
            this.contextPublisherId = -1;
        }

        return closeAndClean()
                .onSuccess(v -> {
                    this.statusSubscribers.clear();
                    log.info("[Magneto@MagnetoRedisService::stop] Redis service stopped successfully");
                })
                .onFailure(err -> log.error("[Magneto@MagnetoRedisService::stop] Error stopping Redis service", err));
    }

    /**
     * Établit la connexion d'écoute Redis
     */
    private Future<Void> listenToRedis() {
        log.info("[Magneto@MagnetoRedisService::listenToRedis] Establishing Redis listener connection");
        final long startTime = System.currentTimeMillis();
        final Promise<Void> promise = Promise.promise();

        if (subscriberConnection.alreadyConnected()) {
            log.info("[Magneto@MagnetoRedisService::listenToRedis] Already connected to Redis");
            promise.complete();
        } else {
            log.info("[Magneto@MagnetoRedisService::listenToRedis] Creating new Redis connection...");
            Redis.createClient(vertx, getRedisOptions(vertx, config))
                    .connect(onConnect -> {
                        final long connectTime = System.currentTimeMillis();
                        if (onConnect.succeeded()) {
                            log.info("[Magneto@MagnetoRedisService::listenToRedis] Redis connection established in " +
                                    (connectTime - startTime) + "ms");
                            this.restartAttempt = 0;
                            promise.complete();
                            RedisConnection client = onConnect.result();
                            subscriberConnection.connection = client;

                            client.handler(message -> {
                                try {
                                    log.info("[Magneto@MagnetoRedisService::listenToRedis] Received Redis message");
                                    if (Field.MESSAGE.equals(message.get(0).toString())) {
                                        String receivedMessage = message.get(2).toString();
                                        log.info("[Magneto@MagnetoRedisService::listenToRedis] Processing message of length: " + receivedMessage.length());
                                        this.onNewRedisMessage(receivedMessage);
                                    } else {
                                        log.info("[Magneto@MagnetoRedisService::listenToRedis] Ignoring non-message Redis event: " + message.get(0));
                                    }
                                } catch (Exception e) {
                                    log.error("[Magneto@MagnetoRedisService::listenToRedis] Exception treating Redis message: " + message, e);
                                }
                            }).exceptionHandler(t -> {
                                log.error("[Magneto@MagnetoRedisService::listenToRedis] REDIS CONNECTION LOST - triggering reconnection", t);
                                notifyStatusChange(RealTimeStatus.ERROR);
                                this.listenToRedis();
                            }).send(Request.cmd(Command.SUBSCRIBE).arg(channelName), subscribeResult -> {
                                final long subscribeTime = System.currentTimeMillis();
                                if (subscribeResult.succeeded()) {
                                    log.info("[Magneto@MagnetoRedisService::listenToRedis] Successfully subscribed to channel " +
                                            channelName + " in " + (subscribeTime - connectTime) + "ms");
                                    notifyStatusChange(RealTimeStatus.STARTED);
                                } else {
                                    log.error("[Magneto@MagnetoRedisService::listenToRedis] Failed to subscribe to channel " +
                                            channelName + " after " + (subscribeTime - connectTime) + "ms", subscribeResult.cause());
                                    notifyStatusChange(RealTimeStatus.ERROR);
                                }
                            });
                        } else {
                            log.error("[Magneto@MagnetoRedisService::listenToRedis] Failed to connect to Redis in " +
                                    (connectTime - startTime) + "ms", onConnect.cause());
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
        log.info("[Magneto@MagnetoRedisService::publishMessage] Publishing single message for board: " + message.getBoardId());
        return publishMessagesOnRedis(Collections.singletonList(message));
    }

    /**
     * Publie plusieurs messages sur Redis séquentiellement
     */
    public Future<Void> publishMessages(List<MagnetoMessage> messages) {
        log.info("[Magneto@MagnetoRedisService::publishMessages] Publishing " + messages.size() + " messages to Redis");
        return publishMessagesOnRedis(messages);
    }

    /**
     * Publie les métadonnées d'un board spécifique
     */
    public Future<Void> publishBoardMetadata(String boardId) {
        log.info("[Magneto@MagnetoRedisService::publishBoardMetadata] Publishing metadata for board: " + boardId);
        final Promise<Void> promise = Promise.promise();
        final CollaborationUsersMetadata metadata = metadataByBoardId.get(boardId);

        if (metadata == null) {
            log.info("[Magneto@MagnetoRedisService::publishBoardMetadata] No metadata found for board: " + boardId);
            promise.complete();
            return promise.future();
        }

        log.info("[Magneto@MagnetoRedisService::publishBoardMetadata] Found metadata for board: " + boardId +
                " - users: " + metadata.getConnectedUsers().size() + ", editing: " + metadata.getEditing().size());
        final JsonObject payload = new JsonObject().put(boardId, JsonObject.mapFrom(metadata));

        redisPublisher.set(newArrayList(
                metadataCollectionPrefix + serverId + "_" + boardId,
                payload.encode(),
                "PX",
                String.valueOf(2 * publishPeriodInMs)
        ), onPublishDone -> {
            if (onPublishDone.succeeded()) {
                log.info("[Magneto@MagnetoRedisService::publishBoardMetadata] Board metadata published successfully for: " + boardId);
                promise.complete();
            } else {
                log.error("[Magneto@MagnetoRedisService::publishBoardMetadata] Failed to publish board metadata for: " + boardId, onPublishDone.cause());
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
        log.info("[Magneto@MagnetoRedisService::getBoardMetadata] Getting metadata for board: " + boardId);
        final Promise<CollaborationUsersMetadata> promise = Promise.promise();

        this.redisPublisher.keys(metadataCollectionPrefix + "*_" + boardId, e -> {
            if (e.succeeded()) {
                final List<String> keys = e.result().stream()
                        .map(Response::toString)
                        .filter(key -> !key.endsWith(serverId + "_" + boardId))
                        .distinct()
                        .collect(Collectors.toList());

                log.info("[Magneto@MagnetoRedisService::getBoardMetadata] Found " + keys.size() + " remote metadata keys for board: " + boardId);
                getOtherInstancesMetadata(boardId, keys).onComplete(promise);
            } else {
                log.error("[Magneto@MagnetoRedisService::getBoardMetadata] Failed to get metadata keys for board: " + boardId, e.cause());
                promise.fail(e.cause());
            }
        });

        return promise.future()
                .onFailure(th -> {
                    log.error("[Magneto@MagnetoRedisService::getBoardMetadata] Error getting board metadata for: " + boardId, th);
                    notifyStatusChange(RealTimeStatus.ERROR);
                });
    }

    /**
     * Publication séquentielle des messages sur Redis
     */
    private Future<Void> publishMessagesOnRedis(List<MagnetoMessage> messages) {
        final long startTime = System.currentTimeMillis();
        return publishMessagesOnRedis(messages, 0)
                .onSuccess(e -> {
                    final long duration = System.currentTimeMillis() - startTime;
                    log.info("[Magneto@MagnetoRedisService::publishMessagesOnRedis] " + messages.size() +
                            " messages published successfully in " + duration + "ms");
                })
                .onFailure(err -> {
                    final long duration = System.currentTimeMillis() - startTime;
                    log.error("[Magneto@MagnetoRedisService::publishMessagesOnRedis] Failed to publish " + messages.size() +
                            " messages after " + duration + "ms", err);
                });
    }

    /**
     * Publication récursive des messages à partir d'un index
     */
    private Future<Void> publishMessagesOnRedis(List<MagnetoMessage> messages, int index) {
        final Promise<Void> promise = Promise.promise();
        if (messages == null || messages.size() <= index) {
            log.info("[Magneto@MagnetoRedisService::publishMessagesOnRedis] All messages processed at index: " + index);
            promise.complete();
        } else {
            final String payload = Json.encode(messages.get(index));
            log.info("[Magneto@MagnetoRedisService::publishMessagesOnRedis] Publishing message " + (index + 1) + "/" +
                    messages.size() + " - payload size: " + payload.length() + " bytes");

            redisPublisher.publish(channelName, payload, e -> {
                if (e.succeeded()) {
                    log.info("[Magneto@MagnetoRedisService::publishMessagesOnRedis] Message " + (index + 1) + " published successfully");
                    publishMessagesOnRedis(messages, index + 1).onComplete(promise);
                } else {
                    log.error("[Magneto@MagnetoRedisService::publishMessagesOnRedis] Failed to publish message " + (index + 1) +
                            " - payload: " + payload, e.cause());
                    notifyStatusChange(RealTimeStatus.ERROR);
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
        log.info("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Processing " + keys.size() + " keys for board: " + boardId);
        final Promise<CollaborationUsersMetadata> promise = Promise.promise();

        if (keys.isEmpty()) {
            // Retourner les métadonnées locales uniquement
            CollaborationUsersMetadata localMetadata = metadataByBoardId.get(boardId);
            log.info("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] No remote keys - returning local metadata only for board: " + boardId);
            promise.complete(localMetadata != null ? localMetadata : new CollaborationUsersMetadata());
        } else {
            log.info("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Fetching remote metadata for keys: " + keys);
            this.redisPublisher.mget(keys, entriesResponse -> {
                if (entriesResponse.succeeded()) {
                    log.info("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Successfully fetched remote metadata entries");

                    final CollaborationUsersMetadata otherInstancesMetadata = entriesResponse.result().stream()
                            .map(entry -> {
                                try {
                                    return new JsonObject(entry.toString());
                                } catch (Exception e) {
                                    log.warn("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Failed to parse entry: " + entry, e);
                                    return null;
                                }
                            })
                            .filter(Objects::nonNull)
                            .map(entry -> entry.getJsonObject(boardId))
                            .filter(Objects::nonNull)
                            .map(rawContext -> {
                                try {
                                    return rawContext.mapTo(CollaborationUsersMetadata.class);
                                } catch (Exception e) {
                                    log.warn("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Failed to map metadata: " + rawContext, e);
                                    return null;
                                }
                            })
                            .filter(Objects::nonNull)
                            .reduce(CollaborationUsersMetadata::merge)
                            .orElseGet(CollaborationUsersMetadata::new);

                    final CollaborationUsersMetadata localMetadata = metadataByBoardId.computeIfAbsent(
                            boardId, k -> new CollaborationUsersMetadata());

                    CollaborationUsersMetadata mergedMetadata = CollaborationUsersMetadata.merge(localMetadata, otherInstancesMetadata);
                    log.info("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Merged metadata for board " + boardId +
                            " - total users: " + mergedMetadata.getConnectedUsers().size() + ", editing: " + mergedMetadata.getEditing().size());

                    promise.complete(mergedMetadata);
                } else {
                    log.error("[Magneto@MagnetoRedisService::getOtherInstancesMetadata] Failed to get metadata values for board: " +
                            boardId + " from keys: " + keys, entriesResponse.cause());
                    promise.fail(entriesResponse.cause());
                }
            });
        }
        return promise.future();
    }

    /**
     * Traite un nouveau message reçu de Redis
     */
    private void onNewRedisMessage(String payload) {
        log.info("[Magneto@MagnetoRedisService::onNewRedisMessage] Processing Redis message of length: " + payload.length());
        final long startTime = System.currentTimeMillis();

        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(DeserializationFeature.FAIL_ON_IGNORED_PROPERTIES, false);
            mapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);

            final MagnetoMessage message = mapper.readValue(payload, MagnetoMessage.class);

            if (!serverId.equals(message.getEmittedBy())) {
                log.info("[Magneto@MagnetoRedisService::onNewRedisMessage] Processing external message from server: " +
                        message.getEmittedBy() + " for board: " + message.getBoardId());

                // Notifier tous les handlers du message reçu
                int handlerCount = 0;
                for (final Handler<MagnetoMessageWrapper> messagesSubscriber : this.messageHandlers) {
                    try {
                        handlerCount++;
                        log.info("[Magneto@MagnetoRedisService::onNewRedisMessage] Notifying handler " + handlerCount + "/" + this.messageHandlers.size());
                        messagesSubscriber.handle(new MagnetoMessageWrapper(newArrayList(message), false, true, null));
                    } catch (Exception e) {
                        log.error("[Magneto@MagnetoRedisService::onNewRedisMessage] Error in message handler " + handlerCount, e);
                    }
                }

                final long duration = System.currentTimeMillis() - startTime;
                log.info("[Magneto@MagnetoRedisService::onNewRedisMessage] Redis message processed in " + duration +
                        "ms - notified " + handlerCount + " handlers");
            } else {
                log.info("[Magneto@MagnetoRedisService::onNewRedisMessage] Ignoring message from same server: " + serverId);
            }
        } catch (Exception e) {
            final long duration = System.currentTimeMillis() - startTime;
            log.error("[Magneto@MagnetoRedisService::onNewRedisMessage] Error processing Redis message after " + duration +
                    "ms - payload: " + payload, e);
        }
    }

    /**
     * Publication périodique des métadonnées de tous les boards
     */
    private Future<Void> publishContextLoop() {
        log.info("[Magneto@MagnetoRedisService::publishContextLoop] Setting up context publish loop every " + publishPeriodInMs + "ms");
        final Promise<Void> promise = Promise.promise();

        if (contextPublisherId >= 0) {
            log.info("[Magneto@MagnetoRedisService::publishContextLoop] Context publish loop already running with ID: " + contextPublisherId);
            promise.complete();
        } else {
            this.contextPublisherId = vertx.setPeriodic(publishPeriodInMs, timerId -> {
                log.info("[Magneto@MagnetoRedisService::publishContextLoop] Context publish timer triggered - ID: " + timerId);
                publishAllMetadata()
                        .onSuccess(v -> log.info("[Magneto@MagnetoRedisService::publishContextLoop] Context publish completed successfully"))
                        .onFailure(err -> log.error("[Magneto@MagnetoRedisService::publishContextLoop] Context publish failed", err));
            });

            log.info("[Magneto@MagnetoRedisService::publishContextLoop] Context publish loop started with timer ID: " + contextPublisherId);
            promise.complete();
        }
        return promise.future();
    }

    /**
     * Publie les métadonnées de tous les boards actifs
     */
    private Future<Void> publishAllMetadata() {
        final Promise<Void> promise = Promise.promise();
        final int boardCount = metadataByBoardId.size();
        log.info("[Magneto@MagnetoRedisService::publishAllMetadata] Publishing metadata for " + boardCount + " active boards");

        if (metadataByBoardId.isEmpty()) {
            log.info("[Magneto@MagnetoRedisService::publishAllMetadata] No boards to publish - skipping");
            promise.complete();
            return promise.future();
        }

        final String payload = Json.encode(metadataByBoardId);
        final String key = metadataCollectionPrefix + serverId;
        log.info("[Magneto@MagnetoRedisService::publishAllMetadata] Publishing to key: " + key +
                " - payload size: " + payload.length() + " bytes, TTL: " + (2 * publishPeriodInMs) + "ms");

        redisPublisher.set(newArrayList(
                key,
                payload,
                "PX",
                String.valueOf(2 * publishPeriodInMs)
        ), onPublishDone -> {
            if (onPublishDone.succeeded()) {
                log.info("[Magneto@MagnetoRedisService::publishAllMetadata] Successfully published metadata for " + boardCount + " boards");
                promise.complete();
            } else {
                log.error("[Magneto@MagnetoRedisService::publishAllMetadata] Failed to publish metadata for " + boardCount +
                        " boards - key: " + key, onPublishDone.cause());
                notifyStatusChange(RealTimeStatus.ERROR);
                promise.fail(onPublishDone.cause());
            }
        });
        return promise.future();
    }

    /**
     * Gestion de la perte de connexion Redis
     */
    private Future<Void> onRedisConnectionStopped(Throwable cause) {
        log.error("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Redis connection lost - attempt: " + restartAttempt, cause);
        notifyStatusChange(RealTimeStatus.ERROR);
        this.restartAttempt++;
        final long factor = Math.max(0L, restartAttempt - 1);
        final long delay = (long) (reConnectionDelay * Math.pow(2, factor));
        final Promise<Void> promise = Promise.promise();

        log.info("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Scheduling reconnection attempt " + restartAttempt +
                " in " + delay + "ms (backoff factor: " + factor + ")");

        vertx.setTimer(delay, e -> {
            log.info("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Attempting to reconnect to Redis (attempt " + restartAttempt + ")");
            start().onComplete(ar -> {
                if (ar.succeeded()) {
                    log.info("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Reconnection successful after " + restartAttempt + " attempts");
                } else {
                    log.error("[Magneto@MagnetoRedisService::onRedisConnectionStopped] Reconnection attempt " + restartAttempt + " failed", ar.cause());
                }
                promise.handle(ar);
            });
        });
        return promise.future();
    }

    /**
     * Notifie les subscribers d'un changement de statut
     */
    private void notifyStatusChange(RealTimeStatus status) {
        log.info("[Magneto@MagnetoRedisService::notifyStatusChange] Status changing to: " + status +
                " - notifying " + statusSubscribers.size() + " subscribers");

        for (int i = 0; i < statusSubscribers.size(); i++) {
            Handler<RealTimeStatus> subscriber = statusSubscribers.get(i);
            try {
                subscriber.handle(status);
                log.info("[Magneto@MagnetoRedisService::notifyStatusChange] Notified subscriber " + (i + 1) + "/" + statusSubscribers.size());
            } catch (Exception e) {
                log.error("[Magneto@MagnetoRedisService::notifyStatusChange] Error in status subscriber " + (i + 1), e);
            }
        }
    }

    /**
     * Ferme les connexions Redis
     */
    private Future<Void> closeAndClean() {
        log.info("[Magneto@MagnetoRedisService::closeAndClean] Closing Redis connections");

        try {
            if (subscriberConnection.connection != null) {
                log.info("[Magneto@MagnetoRedisService::closeAndClean] Closing subscriber connection");
                subscriberConnection.close();
            }
        } catch (Exception e) {
            log.error("[Magneto@MagnetoRedisService::closeAndClean] Error closing Redis subscriber", e);
        }

        try {
            if (redisPublisher != null) {
                log.info("[Magneto@MagnetoRedisService::closeAndClean] Closing publisher connection");
                redisPublisher.close();
            }
        } catch (Exception e) {
            log.error("[Magneto@MagnetoRedisService::closeAndClean] Error closing Redis publisher", e);
        }

        log.info("[Magneto@MagnetoRedisService::closeAndClean] Redis connections closed");
        return Future.succeededFuture();
    }

    /**
     * Configuration des options Redis
     */
    private RedisOptions getRedisOptions(Vertx vertx, JsonObject conf) {
        log.info("[Magneto@MagnetoRedisService::getRedisOptions] Configuring Redis options");
        JsonObject redisConfig = conf.getJsonObject(Field.REDISCONFIG);

        if (redisConfig == null) {
            final String redisConf = (String) vertx.sharedData().getLocalMap(Field.SERVER).get(Field.REDISCONFIG);
            if (redisConf == null) {
                log.error("[Magneto@MagnetoRedisService::getRedisOptions] Missing Redis configuration");
                throw new IllegalStateException("missing.redis.config");
            } else {
                redisConfig = new JsonObject(redisConf);
                log.info("[Magneto@MagnetoRedisService::getRedisOptions] Redis config loaded from shared data");
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