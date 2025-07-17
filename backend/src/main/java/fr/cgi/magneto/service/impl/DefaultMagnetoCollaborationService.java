package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.core.events.CollaborationUsersMetadata;
import fr.cgi.magneto.core.events.MagnetoUserAction;
import fr.cgi.magneto.excpetion.BadRequestException;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.MagnetoMessage;
import fr.cgi.magneto.helper.MagnetoMessageWrapper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.comments.CommentPayload;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import fr.cgi.magneto.service.ServiceFactory;
import io.vertx.core.*;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import static com.google.common.collect.Lists.newArrayList;
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
    private final MagnetoMessageFactory messageFactory;
    private final Map<String, CollaborationUsersMetadata> metadataByBoardId;

    public DefaultMagnetoCollaborationService(ServiceFactory serviceFactory) {
        this.vertx = serviceFactory.vertx();
        this.config = serviceFactory.config();
        this.serviceFactory = serviceFactory;
        this.realTimeStatus = RealTimeStatus.STOPPED;
        this.serverId = UUID.randomUUID().toString();
        this.messageFactory = new MagnetoMessageFactory(serverId);
        this.statusSubscribers = new ArrayList<>();
        this.messagesSubscribers = new ArrayList<>();
        this.publishPeriodInMs = config.getLong("publish-context-period-in-ms", 60000L);
        this.maxConnectedUser = config.getLong("max-connected-user", 50L);
        this.eventBusAddress = config.getString("eventbus-address", "magneto.collaboration");
        this.metadataByBoardId = new HashMap<>();
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

    private void broadcastMessagesToUsers(final List<MagnetoMessage> messages,
                                          final boolean allowInternalMessages,
                                          final boolean allowExternalMessages,
                                          final String exceptWsId) {
        for (final Handler<MagnetoMessageWrapper> messagesSubscriber : this.messagesSubscribers) {
            try {
                messagesSubscriber.handle(new MagnetoMessageWrapper(messages, allowInternalMessages, allowExternalMessages, exceptWsId));
            } catch (Exception e) {
                log.error("An error occurred while sending a message to users", e);
            }
        }
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
                    if (jsonMessage.containsKey("connectedUsers") || jsonMessage.containsKey("editing")) {
                        String boardId = jsonMessage.getString("boardId");
                        if (boardId != null) {
                            try {
                                // Optionnel : mettre à jour les métadonnées locales
                                // (utile si vous avez plusieurs instances)
                                log.debug("Received collaboration message with metadata for board: " + boardId);
                            } catch (Exception e) {
                                String message = String.format("[Magneto@%s::onNewMessage] Error processing collaboration metadata",
                                        this.getClass().getSimpleName());
                                log.error(message, e);
                            }
                        }
                    }
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
        vertx.setPeriodic(publishPeriodInMs, timerId -> {
            JsonObject contextInfo = new JsonObject()
                    .put("type", "context")
                    .put("serverId", serverId)
                    .put("timestamp", System.currentTimeMillis());

            publishMessage(contextInfo);
        });
    }

    @Override
    public Future<List<MagnetoMessage>> onNewUserAction(final MagnetoUserAction action, String boardId, String wsId, final UserInfos user, final boolean checkConcurency) {

        if (action == null) {
            log.warn("Message does not contain a type");
            return Future.failedFuture("wall.action.missing");
        } else {
            try {
                if (action.isValid()) {
                    return executeAction(action, boardId, wsId, user, checkConcurency);
                } else {
                    return Future.failedFuture("magneto.action.invalid");
                }
            } catch (Exception e) {
                return Future.failedFuture(e);
            }
        }
    }

    @Override
    public Future<List<MagnetoMessage>> executeAction(final MagnetoUserAction action, String boardId, String wsId, final UserInfos user, final boolean checkConcurency) {
        switch (action.getType()) {
            case connection:
            case disconnection: {
                return Future.succeededFuture(Collections.emptyList());
            }
            case ping: {
                return Future.succeededFuture(newArrayList(this.messageFactory.ping(boardId, wsId, user.getUserId())));
            }

            case cardAdded: {
                CardPayload cardPayload = action.getCard()
                        .setOwnerId(user.getUserId())
                        .setOwnerName(user.getUsername());
                return this.serviceFactory.cardService().createCardLayout(cardPayload, null, user)
                        .compose(saved -> this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId)))
                        .compose(board -> this.serviceFactory.cardService().getCardsOrFirstSection(board.get(0), user)
                                .map(cards -> newArrayList(this.messageFactory.cardAdded(boardId, wsId, user.getUserId(), cards, action.getActionType(), action.getActionId()))));
            }
            case cardUpdated: {
                CardPayload updateCard = new CardPayload(action.getCard().toJson())
                        .setId(action.getCard().getId())
                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT))
                        .setLastModifierId(user.getUserId())
                        .setLastModifierName(user.getUsername());
                Future<JsonObject> updateCardFuture = this.serviceFactory.cardService().update(updateCard);
                Future<List<Board>> getBoardFuture = this.serviceFactory.boardService().getBoards(Collections.singletonList(updateCard.getBoardId()));
                return CompositeFuture.all(updateCardFuture, getBoardFuture)
                        .compose(result -> {
                            Board currentBoard = getBoardFuture.result().get(0);
                            BoardPayload boardToUpdate = new BoardPayload()
                                    .setId(currentBoard.getId())
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            return this.serviceFactory.boardService().update(boardToUpdate);
                        })
                        .map(saved -> newArrayList(this.messageFactory.cardUpdated(boardId, wsId, user.getUserId(), new Card(updateCard.toJson()).setId(updateCard.getId()), action.getActionType(), action.getActionId())));
            }
            case boardUpdated: {
                return this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                        .compose(boards -> {
                            boolean hasCommRight = WorkflowHelper.hasRight(user, Rights.COMMENT_BOARD);
                            JsonObject board = action.getBoard().toJson();
                            if (!hasCommRight) {
                                board.remove(Field.CANCOMMENT);
                            }
                            boolean hasDisplayNbFavoritesRight = WorkflowHelper.hasRight(user, Rights.DISPLAY_NB_FAVORITES);
                            if (!hasDisplayNbFavoritesRight) {
                                board.remove(Field.DISPLAY_NB_FAVORITES);
                            }
                            BoardPayload updateBoard = new BoardPayload(board)
                                    .setId(boardId)
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            Board currentBoard = boards.get(0);
                            return this.serviceFactory.boardService().updateLayoutCards(updateBoard, currentBoard, null, user)
                                    .compose(boardUpdated -> this.serviceFactory.boardService().update(new BoardPayload(boardUpdated))
                                            .map(result -> newArrayList(this.messageFactory.boardUpdated(boardId, wsId, user.getUserId(), new Board(boardUpdated), action.getActionType(), action.getActionId()))));
                        });
            }
            case sectionUpdated: {
                return serviceFactory.sectionService().update(action.getSection())
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateSection] Failed to update section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .map(result -> newArrayList(this.messageFactory.sectionUpdated(boardId, wsId, user.getUserId(), new Section(action.getSection().toJson()), action.getActionType(), action.getActionId())));
            }
            case cardFavorite: {
                String cardId = action.getCard().getId();
                boolean favorite = action.getIsLiked();
                if(user == null){
                    BadRequestException noUser = new BadRequestException("User not found");
                    String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                            this.getClass().getSimpleName(), noUser.getMessage());
                    log.error(message);
                }
                return serviceFactory.cardService().updateFavorite(cardId, favorite, user, true)
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .flatMap(saved -> this.serviceFactory.cardService().getCards(newArrayList(cardId), user)
                                .map(cards -> {
                                    Card updatedCard = cards.isEmpty() ? new Card(action.getCard().toJson()) : cards.get(0);
                                    return newArrayList(this.messageFactory.cardFavorite(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                                }));
            }
            case commentAdded: {
                CommentPayload commentPayload = new CommentPayload(action.getComment().toJson())
                        .setOwnerId(user.getUserId())
                        .setOwnerName(user.getUsername());

                this.serviceFactory.commentService().createComment(commentPayload, action.getCardId())
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                    this.getClass().getSimpleName());
                            log.error(message);
                        })
                        .compose(r -> this.serviceFactory.cardService().getCards(newArrayList(action.getCardId()), user))
                        .map(cards -> {
                            Card updatedCard = cards.isEmpty() ? new Card() : cards.get(0);
                            return newArrayList(this.messageFactory.commentAdded(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                        });
            }
            case commentDeleted: {
                this.serviceFactory.commentService().deleteComment(user.getUserId(), action.getCardId(), action.getCommentId())
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                    this.getClass().getSimpleName());
                            log.error(message);
                        })
                        .compose(r -> this.serviceFactory.cardService().getCards(newArrayList(action.getCardId()), user))
                        .map(cards -> {
                            Card updatedCard = cards.isEmpty() ? new Card() : cards.get(0);
                            return newArrayList(this.messageFactory.commentDeleted(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                        });
            }
            case commentEdited: {
                CommentPayload commentPayload = new CommentPayload(user, action.getComment().getId(), action.getComment().getContent());

                this.serviceFactory.commentService().updateComment(commentPayload, action.getCardId())
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                    this.getClass().getSimpleName());
                            log.error(message);
                        })
                        .compose(r -> this.serviceFactory.cardService().getCards(newArrayList(action.getCardId()), user))
                        .map(cards -> {
                            Card updatedCard = cards.isEmpty() ? new Card() : cards.get(0);
                            return newArrayList(this.messageFactory.commentEdited(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                        });
            }
            case cardDuplicated: {
                List<String> cardIds = action.getCardsIds();
                String destinationBoardId = action.getBoardId();

                return this.serviceFactory.cardService().getCards(cardIds, user)
                        .compose(cardsToDuplicate -> this.serviceFactory.cardService().duplicateCards(destinationBoardId, cardsToDuplicate, null, user))
                        .compose(res -> this.serviceFactory.boardService().getBoards(Collections.singletonList(destinationBoardId)))
                        .compose(boards -> this.serviceFactory.cardService().getCardsOrFirstSection(boards.get(0), user))
                        .map(cards -> destinationBoardId.equals(boardId) ?
                                newArrayList(this.messageFactory.cardDuplicated(boardId, wsId, user.getUserId(), cards, action.getActionType(), action.getActionId())) :
                                new ArrayList<>());
            }
            case sectionDuplicated: {
                List<String> sectionIds = action.getSectionIds();
                String destinationBoardId = action.getBoardId();
                return this.serviceFactory.sectionService().duplicateSectionsWithCards(destinationBoardId, sectionIds, user)
                        .compose(res -> this.serviceFactory.boardService().getBoardWithContent(boardId, user))
                        .map(board -> newArrayList(this.messageFactory.sectionDuplicated(boardId, wsId, user.getUserId(), board, action.getActionType(), action.getActionId())));
            }
            case sectionAdded: {
                String newId = UUID.randomUUID().toString();
                return serviceFactory.sectionService().createSectionWithBoardUpdate(action.getSection(), newId)
                        .map(result -> newArrayList(this.messageFactory.sectionAdded(boardId, wsId, user.getUserId(), new Section(action.getSection().toJson()).setId(newId), action.getActionType(), action.getActionId())));
            }
            case cardsDeleted: {
                List<String> cardIds = action.getCardsIds();
                String destinationBoardId = action.getBoardId();
                List<Card> cards = cardIds.stream()
                        .map(cardId -> new Card().setId(cardId))
                        .collect(Collectors.toList());
                return serviceFactory.cardService().deleteCardsWithBoardValidation(cardIds, destinationBoardId, user)
                        .map(result -> newArrayList(this.messageFactory.cardsDeleted(boardId, wsId, user.getUserId(), cards, action.getActionType(), action.getActionId())));
            }
            case sectionsDeleted: {
                List<String> sectionIds = action.getSectionIds();
                String destinationBoardId = action.getBoardId();
                Boolean deleteCards = action.getDeleteCards();
                return serviceFactory.sectionService().deleteSections(sectionIds, destinationBoardId, deleteCards)
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::deleteSections] Failed to delete sections : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .compose(res -> this.serviceFactory.boardService().getBoardWithContent(boardId, user))
                        .map(board -> newArrayList(this.messageFactory.sectionsDeleted(boardId, wsId, user.getUserId(), board, action.getActionType(), action.getActionId())));
            }
            /*
            case cardEditionStarted: {
                // add to editing
                context.getEditing().add(new MagnetoEditingInformation(user.getUserId(), action.getNoteId(), System.currentTimeMillis()));
                // client has start editing => broadcast to other users
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteEditionStarted(boardId, wsId, user.getUserId(), action.getNoteId(), action.getActionType(), action.getActionId())));
            }
            case cardEditionEnded: {
                // remove from editing
                context.getEditing().removeIf(info -> info.getUserId().equals(user.getUserId()));
                // publish meta
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteEditionEnded(boardId, wsId, user.getUserId(), action.getNoteId(), action.getActionType(), action.getActionId())));
            }
            case cardMoved: {
                // client has moved the note => DONT patch now => broadcast to other users
                return Future.succeededFuture(newArrayList(this.messageFactory.noteMoved(boardId, wsId, user.getUserId(), action.getNote(), action.getActionType(), action.getActionId())));
            }
            case cardSelected: {
                // add to editing
                context.getEditing().add(new MagnetoEditingInformation(user.getUserId(), action.getNoteId(), System.currentTimeMillis()));
                // client has selected note => broadcast to other users
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteSelected(boardId, wsId, user.getUserId(), action.getNoteId(), action.getActionType(), action.getActionId())));
            }
            case noteUnselected: {
                // remove from editing
                context.getEditing().removeIf(info -> info.getUserId().equals(user.getUserId()));
                // client has unselected note => broadcast to other users
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteUnselected(boardId, wsId, user.getUserId(), action.getNoteId(), action.getActionType(), action.getActionId())));
            }
            case wallDeleted: {
                // client has deleted the wall => delete then broadcast to other users
                return this.collaborativeWallService.deleteWall(boardId, user)
                        .map(saved -> newArrayList(this.messageFactory.wallDeleted(boardId, wsId, user.getUserId(), action.getActionType(), action.getActionId())));
            }*/
        }
        return Future.succeededFuture(Collections.emptyList());
    }

    @Override
    public Future<List<MagnetoMessage>> pushEventToAllUsers(final String boardId, final UserInfos session, final MagnetoUserAction action, final boolean checkConcurency) {
        return pushEvent(boardId, session, action, "", checkConcurency);
    }

    @Override
    public Future<List<MagnetoMessage>> pushEvent(final String boardId, final UserInfos session, final MagnetoUserAction action, final String wsId, final boolean checkConcurency) {
        return this.onNewUserAction(action, boardId, wsId, session, checkConcurency)
                .onSuccess(messages -> {
                    switch (action.getType()) {
                        case ping:
                        case cardAdded:
                        case cardMoved:
                        case cardUpdated:
                            this.broadcastMessagesToUsers(messages, true, false, null);
                            return;
                        default:
                            this.broadcastMessagesToUsers(messages, true, false, null);
                            return;
                    }
                });
    }

    private Future<Void> publishMetadata(String boardId, CollaborationUsersMetadata context) {
        try {
            JsonObject metadataMessage = new JsonObject()
                    .put("type", "metadata")
                    .put("serverId", serverId)
                    .put("boardId", boardId)
                    .put("timestamp", System.currentTimeMillis())
                    .put("connectedUsers", Json.encode(context.getConnectedUsers()))
                    .put("editing", Json.encode(context.getEditing()));

            return publishMessage(metadataMessage);
        } catch (Exception e) {
            String message = String.format("[Magneto@%s::publishMetadataViaEventBus] Error publishing metadata",
                    this.getClass().getSimpleName());
            log.error(message, e);
            return Future.failedFuture(e);
        }
    }

    @Override
    public Future<List<MagnetoMessage>> onNewConnection(String boardId, UserInfos user, final String wsId) {
        final MagnetoMessage newUserMessage = this.messageFactory.connection(boardId, wsId, user.getUserId());

        // Récupérer ou créer le contexte pour ce board
        final CollaborationUsersMetadata context = metadataByBoardId.computeIfAbsent(boardId, k -> new CollaborationUsersMetadata());

        // Ajouter l'utilisateur connecté au contexte
        context.addConnectedUser(user);

        // Créer le message avec les métadonnées (utilisateurs connectés, etc.)
        final MagnetoMessage metadataMessage = this.messageFactory.metadata(
                boardId,
                wsId,
                user.getUserId(),
                new CollaborationUsersMetadata(
                        context.getEditing(),
                        context.getConnectedUsers()
                ),
                this.maxConnectedUser
        );

        // Publier les métadonnées mises à jour via EventBus
        return publishMetadata(boardId, context)
                .map(v -> Arrays.asList(newUserMessage, metadataMessage))
                .compose(messages -> {
                    // Publier le message de connexion aux autres utilisateurs
                    JsonObject collaborationMessage = new JsonObject()
                            .put("type", "collaboration")
                            .put("serverId", serverId)
                            .put("messages", Json.encode(Collections.singletonList(newUserMessage)));

                    return publishMessage(collaborationMessage)
                            .map(v -> messages);
                });
    }

    @Override
    public Future<List<MagnetoMessage>> onNewDisconnection(String boardId, String userId, final String wsId) {
        Promise<List<MagnetoMessage>> promise = Promise.promise();
        final MagnetoMessage disconnectionMessage = this.messageFactory.disconnection(boardId, wsId, userId);

        // Récupérer le contexte pour ce board
        final CollaborationUsersMetadata context = metadataByBoardId.get(boardId);
        List<MagnetoMessage> messages = new ArrayList<>();
        messages.add(disconnectionMessage);

        if (context != null) {
            // Retirer l'utilisateur du contexte
            context.removeConnectedUser(userId);

            // Si plus personne n'est connecté, on peut supprimer le contexte
            if (context.getConnectedUsers().isEmpty()) {
                metadataByBoardId.remove(boardId);
            }
            final MagnetoMessage metadataMessage = this.messageFactory.metadata(
                    boardId,
                    wsId,
                    userId,
                    new CollaborationUsersMetadata(
                            context.getEditing(),
                            context.getConnectedUsers()
                    ),
                    this.maxConnectedUser
            );
            messages.add(metadataMessage);
        }
        promise.complete(messages);
        return promise.future();
    }


    private Future<Void> changeRealTimeStatus(RealTimeStatus realTimeStatus) {
        final Promise<Void> promise = Promise.promise();
        if (realTimeStatus == this.realTimeStatus) {
            promise.complete();
        } else {
            log.debug("Changing real time status : " + this.realTimeStatus + " -> " + realTimeStatus);
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
                        log.error("Error occurred while calling status change handler", exc);
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