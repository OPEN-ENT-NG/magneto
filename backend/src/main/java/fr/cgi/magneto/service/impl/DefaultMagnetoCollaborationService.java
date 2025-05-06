package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.helper.MagnetoMessageWrapper;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import fr.cgi.magneto.service.ServiceFactory;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

import static io.vertx.core.http.impl.HttpClientConnection.log;

public class DefaultMagnetoCollaborationService implements MagnetoCollaborationService {

    private final Vertx vertx;
    private final JsonObject config;
    private final String serverId;
    private final long publishPeriodInMs;
    private final long maxConnectedUser;
    private final List<Handler<RealTimeStatus>> statusSubscribers;
    private final List<Handler<MagnetoMessageWrapper>> messagesSubscribers;
    private final ServiceFactory serviceFactory;
    private RealTimeStatus realTimeStatus;
    private String eventBusAddress;
    private MessageConsumer<JsonObject> eventBusConsumer;

    public DefaultMagnetoCollaborationService(Vertx vertx, final JsonObject config, ServiceFactory serviceFactory) {
        this.vertx = vertx;
        this.config = config;
        this.serviceFactory = serviceFactory;
        this.realTimeStatus = RealTimeStatus.STOPPED;
        this.serverId = UUID.randomUUID().toString();
        this.statusSubscribers = new ArrayList<>();
        this.messagesSubscribers = new ArrayList<>();
        this.publishPeriodInMs = config.getLong("publish-context-period-in-ms", 60000L);
        this.maxConnectedUser = config.getLong("max-connected-user", 50L);
        this.eventBusAddress = config.getString("eventbus-address", "magneto.collaboration");
    }

    @Override
    public Future<Void> start() {
        Promise<Void> promise = Promise.promise();
        if (RealTimeStatus.STARTED.equals(this.realTimeStatus) || RealTimeStatus.LIMIT.equals(this.realTimeStatus)) {
            return Future.failedFuture(this.realTimeStatus + ".cannot.be.started");
        }

        try {
            changeRealTimeStatus(RealTimeStatus.STARTING);

            // Création du consumer sur l'EventBus
            eventBusConsumer = vertx.eventBus().consumer(eventBusAddress);
            eventBusConsumer.handler(ebMessage -> {
                try {
                    JsonObject messageBody = ebMessage.body();
                    this.onNewMessage(messageBody.encode());
                } catch (Exception e) {
                    String message = String.format("[Magneto@%s::start] Cannot treat EventBus message",
                            this.getClass().getSimpleName());
                    log.error(message, e);
                }
            });

            eventBusConsumer.exceptionHandler(t -> {
                String message = String.format("[Magneto@%s::start] EventBus consumer error",
                        this.getClass().getSimpleName());
                log.error(message, t);
                changeRealTimeStatus(RealTimeStatus.ERROR);
                // Tentative de reconnexion
                vertx.setTimer(1000, id -> start());
            });

            eventBusConsumer.completionHandler(ar -> {
                if (ar.succeeded()) {
                    log.info("EventBus consumer registered successfully");
                    changeRealTimeStatus(RealTimeStatus.STARTED).onComplete(promise);
                    publishContextLoop();
                } else {
                    String message = String.format("[Magneto@%s::start] EventBus consumer registration failed",
                            this.getClass().getSimpleName());
                    log.error(message, ar.cause());
                    changeRealTimeStatus(RealTimeStatus.ERROR).onComplete(promise);
                }
            });

        } catch (Exception e) {
            String message = String.format("[Magneto@%s::start] Error starting VertxEventBusMagnetoCollaborationService",
                    this.getClass().getSimpleName());
            log.error(message, e);
            changeRealTimeStatus(RealTimeStatus.ERROR).onComplete(promise);
        }

        return promise.future();
    }

    @Override
    public void onNewMessage(String receivedMessage) {
        try {
            JsonObject jsonMessage = new JsonObject(receivedMessage);

            // Ignorer les messages provenant de cette instance
            if (jsonMessage.containsKey("serverId") && serverId.equals(jsonMessage.getString("serverId"))) {
                return;
            }

            // Traiter le message en fonction de son type
            String messageType = jsonMessage.getString("type", "");

            switch (messageType) {
                case "context":
                    // Traitement des messages de contexte (si nécessaire)
                    break;

                case "collaboration":
                    // Convertir en MagnetoMessageWrapper et notifier les abonnés
                    MagnetoMessageWrapper magnetoMessage = new MagnetoMessageWrapper(jsonMessage);

                    for (Handler<MagnetoMessageWrapper> messagesSubscriber : messagesSubscribers) {
                        try {
                            messagesSubscriber.handle(magnetoMessage);
                        } catch (Exception e) {
                            String message = String.format("[Magneto@%s::onNewMessage] Error occurred while calling message subscriber",
                                    this.getClass().getSimpleName());
                            log.error(message, e);
                        }
                    }
                    break;

                default:
                    log.warn("Unknown message type: " + messageType);
                    break;
            }

        } catch (Exception e) {
            String message = String.format("[Magneto@%s::onNewMessage] Error processing received message: %s",
                    this.getClass().getSimpleName(), receivedMessage);
            log.error(message, e);
        }
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

    // Méthode pour publier un message
    public Future<Void> publishMessage(JsonObject message) {
        return Future.fromCompletionStage(
                CompletableFuture.runAsync(() -> {
                    vertx.eventBus().publish(eventBusAddress, message);
                })
        );
    }

    private void publishContextLoop() {
        // Logique similaire à celle avec Redis
        vertx.setPeriodic(publishPeriodInMs, timerId -> {
            // Publier les informations de contexte
            JsonObject contextInfo = new JsonObject()
                    .put("type", "context")
                    .put("serverId", serverId)
                    .put("timestamp", System.currentTimeMillis());

            publishMessage(contextInfo);
        });
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
                cleanPromise = cleanUp();
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

    private Future<Void> cleanUp() {
        Promise<Void> promise = Promise.promise();
        try {
            if (eventBusConsumer != null) {
                eventBusConsumer.unregister(ar -> {
                    if (ar.succeeded()) {
                        promise.complete();
                    } else {
                        promise.fail(ar.cause());
                    }
                });
            } else {
                promise.complete();
            }
        } catch (Exception e) {
            String message = String.format("[Magneto@%s::cleanUp] Error during cleanup",
                    this.getClass().getSimpleName());
            log.error(message, e);
            promise.fail(e);
        }
        return promise.future();
    }
}