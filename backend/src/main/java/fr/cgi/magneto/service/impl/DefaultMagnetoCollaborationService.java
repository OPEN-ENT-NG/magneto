package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.core.enums.UserColor;
import fr.cgi.magneto.core.events.CollaborationUsersMetadata;
import fr.cgi.magneto.core.events.MagnetoUserAction;
import fr.cgi.magneto.excpetion.BadRequestException;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.MagnetoMessage;
import fr.cgi.magneto.helper.MagnetoMessageWrapper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.comments.CommentPayload;
import fr.cgi.magneto.model.user.User;
import fr.cgi.magneto.service.MagnetoCollaborationService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.*;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonArray;
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
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
            }
            case cardUpdated: {
                CardPayload updateCard = action.getCard()
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
                        .compose(saved -> this.serviceFactory.cardService().getCards(newArrayList(action.getCard().getId()), user))
                        .map(cards -> {
                            Card updatedCard = cards.isEmpty() ? new Card(action.getCard().toJson()).setId(updateCard.getId()) : cards.get(0);
                            return newArrayList(this.messageFactory.cardUpdated(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                        });
            }
            case boardUpdated: {
                return this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                        .compose(boards -> {
                            boolean hasCommRight = WorkflowHelper.hasRight(user, Rights.COMMENT_BOARD);
                            JsonObject boardPayload = action.getBoard().toJson();
                            if (!hasCommRight) {
                                boardPayload.remove(Field.CANCOMMENT);
                            }
                            boolean hasDisplayNbFavoritesRight = WorkflowHelper.hasRight(user, Rights.DISPLAY_NB_FAVORITES);
                            if (!hasDisplayNbFavoritesRight) {
                                boardPayload.remove(Field.DISPLAY_NB_FAVORITES);
                            }
                            BoardPayload updateBoard = new BoardPayload(boardPayload)
                                    .setId(boardId)
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            Board currentBoard = boards.get(0);
                            return this.serviceFactory.boardService().updateLayoutCards(updateBoard, currentBoard, null, user)
                                    .compose(boardUpdated -> this.serviceFactory.boardService().update(new BoardPayload(boardUpdated)))
                                    .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
                        });
            }
            case sectionUpdated: {
                return serviceFactory.sectionService().update(action.getSection())
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateSection] Failed to update section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
            }
            case cardFavorite: {
                String cardId = action.getCard().getId();
                if(user == null){
                    BadRequestException noUser = new BadRequestException("User not found");
                    String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                            this.getClass().getSimpleName(), noUser.getMessage());
                    log.error(message);
                }
                return serviceFactory.cardService().updateFavorite(cardId, action.getCard().isFavorite(), user, true)
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .compose(saved -> this.serviceFactory.cardService().getCards(newArrayList(cardId), user))
                        .compose(res -> this.createCardFavoriteMessagesForUsers(boardId, cardId, wsId, user, action.getActionType()));
            }
            case commentAdded: {
                CommentPayload commentPayload = action.getComment()
                        .setOwnerId(user.getUserId())
                        .setOwnerName(user.getUsername());

                return this.serviceFactory.commentService().createComment(commentPayload, action.getCardId())
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                    this.getClass().getSimpleName());
                            log.error(message);
                        })
                        .compose(r -> this.serviceFactory.cardService().getCards(newArrayList(action.getCardId()), user))
                        .flatMap(cards -> this.serviceFactory.commentService().getAllComments(action.getCardId(), 0)
                                .map(comments -> {
                                    Card updatedCard = cards.isEmpty() ? new Card() : cards.get(0).setComments(comments);
                                    return newArrayList(this.messageFactory.commentAdded(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                                }));
            }
            case commentDeleted: {
                return this.serviceFactory.commentService().deleteComment(user.getUserId(), action.getCardId(), action.getCommentId())
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                    this.getClass().getSimpleName());
                            log.error(message);
                        })
                        .compose(r -> this.serviceFactory.cardService().getCards(newArrayList(action.getCardId()), user))
                        .flatMap(cards -> this.serviceFactory.commentService().getAllComments(action.getCardId(), 0)
                                .map(comments -> {
                                    Card updatedCard = cards.isEmpty() ? new Card() : cards.get(0).setComments(comments);
                                    return newArrayList(this.messageFactory.commentDeleted(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                                }));
            }
            case commentEdited: {
                CommentPayload commentPayload = new CommentPayload(user, action.getComment().getId(), action.getComment().getContent());

                return this.serviceFactory.commentService().updateComment(commentPayload, action.getCardId())
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                    this.getClass().getSimpleName());
                            log.error(message);
                        })
                        .compose(r -> this.serviceFactory.cardService().getCards(newArrayList(action.getCardId()), user))
                        .flatMap(cards -> this.serviceFactory.commentService().getAllComments(action.getCardId(), 0)
                                .map(comments -> {
                                    Card updatedCard = cards.isEmpty() ? new Card() : cards.get(0).setComments(comments);
                                    return newArrayList(this.messageFactory.commentEdited(boardId, wsId, user.getUserId(), updatedCard, action.getActionType(), action.getActionId()));
                                }));
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
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
            }
            case sectionAdded: {
                String newId = UUID.randomUUID().toString();
                return serviceFactory.sectionService().createSectionWithBoardUpdate(action.getSection(), newId)
                        .compose(res -> serviceFactory.sectionService().get(Collections.singletonList(newId)))
                        .flatMap(sections -> this.serviceFactory.cardService().getAllCardsBySectionSimple(sections.get(0), null, user)
                                .map(cards -> newArrayList(this.messageFactory.sectionAdded(boardId, wsId, user.getUserId(), sections.get(0).setCards(cards), action.getActionType(), action.getActionId()))));
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
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
            }
            case cardMoved: {
                String oldBoardId = action.getCard().getBoardId();
                String newBoardId = action.getBoardId();
                CardPayload updateCard = action.getCard()
                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT))
                        .setLastModifierId(user.getUserId())
                        .setLastModifierName(user.getUsername())
                        .setBoardId(newBoardId);

                this.serviceFactory.cardService().processMoveCard(updateCard, oldBoardId, newBoardId, user, null)
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
            }
            case cardsBoardUpdated: {
                List<String> sectionIds = action.getSectionIds();
                List<String> cardIds = action.getCardsIds();
                String destinationBoardId = action.getBoardId();
                return this.serviceFactory.boardService().getBoards(Collections.singletonList(destinationBoardId))
                        .compose(boards -> {
                            if (!boards.isEmpty()) {
                                BoardPayload updateBoard = new BoardPayload()
                                        .setId(destinationBoardId)
                                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                                if (sectionIds != null && !sectionIds.isEmpty())
                                    updateBoard.setSectionIds(sectionIds);
                                if (cardIds != null && !cardIds.isEmpty())
                                    updateBoard.setCardIds(cardIds);
                                return this.serviceFactory.boardService().update(updateBoard);
                            } else {
                                return Future.failedFuture(String.format("[Magneto%s::update] " +
                                        "No board found with id %s", this.getClass().getSimpleName(), boardId));
                            }
                        })
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
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
            JsonArray connectedUsersJson = new JsonArray();
            for (User user : context.getConnectedUsers()) {
                connectedUsersJson.add(user.toJson());
            }
            JsonObject metadataMessage = new JsonObject()
                    .put("type", "metadata")
                    .put("serverId", serverId)
                    .put("boardId", boardId)
                    .put("timestamp", System.currentTimeMillis())
                    .put("connectedUsers", connectedUsersJson)
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
    public Future<List<MagnetoMessage>> onNewConnection(String boardId, UserInfos user, final String wsId, Map<String, User> wsIdToUser) {
        return hasContribRight(boardId, user)
                .compose(hasContrib -> {
                    boolean isReadOnly = !hasContrib;

                    final MagnetoMessage newUserMessage = this.messageFactory.connection(boardId, wsId, user.getUserId());

                    // Récupérer ou créer le contexte pour ce board
                    final CollaborationUsersMetadata context = metadataByBoardId.computeIfAbsent(boardId, k -> new CollaborationUsersMetadata());

                    // Assigner une couleur avant de créer l'utilisateur
                    UserColor assignedColor = assignColorToUser(boardId);

                    // Ajouter l'utilisateur connecté au contexte avec son statut readOnly
                    User userWithColor = new User(user.getUserId(), user.getUsername(), isReadOnly, assignedColor);
                    context.addConnectedUser(userWithColor);

                    wsIdToUser.put(wsId, userWithColor);

                    // Créer le message avec les métadonnées
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
                                JsonObject collaborationMessage = new JsonObject()
                                        .put("type", "collaboration")
                                        .put("serverId", serverId)
                                        .put("messages", Json.encode(Collections.singletonList(newUserMessage)));

                                return publishMessage(collaborationMessage)
                                        .map(v -> messages);
                            });
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

    @Override
    public Future<Boolean> hasContribRight(String boardId, UserInfos user) {
        Promise<Boolean> promise = Promise.promise();

        JsonObject sharedUserCondition = new JsonObject()
                .put(Field.USERID, user.getUserId())
                .put("fr-cgi-magneto-controller-ShareBoardController|initContribRight", true);

        JsonObject sharedGroupCondition = new JsonObject()
                .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                .put("fr-cgi-magneto-controller-ShareBoardController|initContribRight", true);

        JsonObject query = new JsonObject()
                .put(Field._ID, boardId)
                .put(Field.DELETED, false)
                .put(Mongo.OR, new JsonArray()
                        .add(new JsonObject().put(Field.OWNERID, user.getUserId()))
                        .add(new JsonObject().put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, sharedUserCondition)))
                        .add(new JsonObject().put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, sharedGroupCondition))));

        MongoDb.getInstance().count(CollectionsConstant.BOARD_COLLECTION, query, res -> {
            if ("ok".equals(res.body().getString("status"))) {
                boolean hasContrib = res.body().getInteger("count", 0) > 0 && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD);
                promise.complete(hasContrib);
            } else {
                promise.complete(false);
            }
        });

        return promise.future();
    }

    private Future<List<MagnetoMessage>> createBoardMessagesForUsers(String boardId, String wsId, UserInfos user, MagnetoUserAction.ActionType actionType) {
        // Board avec sections : créer deux versions
        List<Future> messageFutures = new ArrayList<>();

        // Version readOnly
        Future<MagnetoMessage> readOnlyMessageFuture = this.serviceFactory.boardService().getBoardWithContent(boardId, user, true)
                .map(board -> this.messageFactory.boardMessage(boardId, wsId, user.getUserId(), board, actionType, Field.READONLY));

        // Version complète
        Future<MagnetoMessage> fullMessageFuture = this.serviceFactory.boardService().getBoardWithContent(boardId, user, false)
                .map(board -> this.messageFactory.boardMessage(boardId, wsId, user.getUserId(), board, actionType, Field.FULLACCESS));

        messageFutures.add(readOnlyMessageFuture);
        messageFutures.add(fullMessageFuture);

        return CompositeFuture.all(messageFutures)
                .map(compositeFuture -> Arrays.asList(readOnlyMessageFuture.result(), fullMessageFuture.result()));
    }

    private Future<List<MagnetoMessage>> createCardFavoriteMessagesForUsers(String boardId, String cardId, String wsId, UserInfos user, MagnetoUserAction.ActionType actionType) {
        // Board avec sections : créer deux versions
        List<Future> messageFutures = new ArrayList<>();

        // Version readOnly
        Future<MagnetoMessage> actualUserFavoriteFuture = this.serviceFactory.cardService().getCards(newArrayList(cardId), user)
                .map(cards -> this.messageFactory.cardFavorite(boardId, wsId, user.getUserId(), cards.get(0), actionType, Field.ACTUALUSER));

        // Version complète
        Future<MagnetoMessage> otherUsersFavoriteFuture = this.serviceFactory.cardService().getCards(newArrayList(cardId), user)
                .map(cards -> this.messageFactory.cardFavorite(boardId, wsId, user.getUserId(), cards.get(0).setIsLiked(null), actionType, Field.OTHERUSERS));

        messageFutures.add(actualUserFavoriteFuture);
        messageFutures.add(otherUsersFavoriteFuture);

        return CompositeFuture.all(messageFutures)
                .map(compositeFuture -> Arrays.asList(actualUserFavoriteFuture.result(), otherUsersFavoriteFuture.result()));
    }

    private UserColor assignColorToUser(String boardId) {
        final CollaborationUsersMetadata context = metadataByBoardId.get(boardId);

        if (context == null || context.getConnectedUsers().isEmpty()) {
            UserColor[] colors = UserColor.values();
            Random random = new Random();
            return colors[random.nextInt(colors.length)];
        }

        // Récupérer les couleurs déjà utilisées depuis le Set
        Set<UserColor> usedColors = context.getConnectedUsers().stream()
                .map(User::getColor)
                .collect(Collectors.toSet());

        // Créer une liste des couleurs disponibles
        List<UserColor> availableColors = Arrays.stream(UserColor.values())
                .filter(color -> !usedColors.contains(color))
                .collect(Collectors.toList());

        Random random = new Random();

        if (!availableColors.isEmpty()) {
            return availableColors.get(random.nextInt(availableColors.size()));
        } else {
            UserColor[] colors = UserColor.values();
            return colors[random.nextInt(colors.length)];
        }
    }
}