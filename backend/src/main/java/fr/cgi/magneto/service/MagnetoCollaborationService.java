package fr.cgi.magneto.service;

import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.helper.MagnetoMessageWrapper;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;

/**
 * Service managing real-time collaboration features for Magneto
 */
public interface MagnetoCollaborationService {

    /**
     * Start the collaboration service
     *
     * @return Future {@link Future<Void>} indicating if the service started successfully
     */
    Future<Void> start();

    /**
     * Subscribe to real-time status changes of the collaboration service
     *
     * @param subscriber Handler that will be called when status changes
     */
    void subscribeToStatusChanges(Handler<RealTimeStatus> subscriber);

    /**
     * Unsubscribe from real-time status changes
     *
     * @param subscriber Handler to unsubscribe
     */
    void unsubscribeToStatusChanges(Handler<RealTimeStatus> subscriber);

    /**
     * Subscribe to receive new messages that need to be sent through the collaboration system
     *
     * @param messagesHandler Handler that will be called when new messages are ready to be sent
     */
    void subscribeToNewMessagesToSend(Handler<MagnetoMessageWrapper> messagesHandler);

    /**
     * Publish a message to all subscribers of the collaboration system
     *
     * @param message Message to publish
     * @return Future {@link Future<Void>} indicating if the message was published successfully
     */
    Future<Void> publishMessage(JsonObject message);

    /**
     * Get current status of the collaboration service
     *
     * @return Current {@link RealTimeStatus} of the service
     */
    default RealTimeStatus getStatus() {
        return RealTimeStatus.STOPPED;
    }

    /**
     * Stop the collaboration service
     *
     * @return Future {@link Future<Void>} indicating if the service stopped successfully
     */
    default Future<Void> stop() {
        return Future.succeededFuture();
    }

    /**
     * Process a new message received from the collaboration system
     *
     * @param message String representation of the received message
     */
    void onNewMessage(String message);
}