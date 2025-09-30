package fr.cgi.magneto.realtime;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.core.enums.RealTimeStatus;
import fr.cgi.magneto.core.enums.UserColor;
import fr.cgi.magneto.excpetion.BadRequestException;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.comments.CommentPayload;
import fr.cgi.magneto.model.user.User;
import fr.cgi.magneto.realtime.events.CardEditingInformation;
import fr.cgi.magneto.realtime.events.CollaborationUsersMetadata;
import fr.cgi.magneto.realtime.events.MagnetoUserAction;
import fr.cgi.magneto.realtime.events.UserBoardRights;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.*;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.stream.Collectors;

import static com.google.common.collect.Lists.newArrayList;
import static fr.cgi.magneto.core.constants.Field.*;
import static fr.cgi.magneto.realtime.CollaborationHelper.assignColorToUser;
import static fr.cgi.magneto.realtime.CollaborationHelper.calculateRights;

public class DefaultMagnetoCollaborationService implements MagnetoCollaborationService {

    private static final Logger log = LoggerFactory.getLogger(DefaultMagnetoCollaborationService.class);

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

    // Redis
    private final boolean isMultiCluster;
    private MagnetoRedisService redisService;

    public DefaultMagnetoCollaborationService(ServiceFactory serviceFactory) {
        this.vertx = serviceFactory.vertx();
        this.serviceFactory = serviceFactory;
        this.realTimeStatus = RealTimeStatus.STOPPED;
        this.serverId = UUID.randomUUID().toString();
        this.messageFactory = new MagnetoMessageFactory(serverId);
        this.statusSubscribers = new ArrayList<>();
        this.messagesSubscribers = new ArrayList<>();
        this.metadataByBoardId = new HashMap<>();
        this.isMultiCluster = serviceFactory.magnetoConfig().getIsMultiCluster();

        this.config = serviceFactory.config();
        this.publishPeriodInMs = config.getLong("publish-context-period-in-ms", 60000L);
        this.maxConnectedUser = config.getLong("max-connected-user", 50L);
        this.eventBusAddress = config.getString("eventbus-address", "magneto.collaboration");

        // Initialisation du service Redis si multi-cluster
        if (isMultiCluster) {
            this.redisService = new MagnetoRedisService(vertx, config, serverId, metadataByBoardId, statusSubscribers, messagesSubscribers);
        }
    }

    @Override
    public Future<Void> start() {
        Promise<Void> promise = Promise.promise();
        if (RealTimeStatus.STARTED.equals(this.realTimeStatus) || RealTimeStatus.LIMIT.equals(this.realTimeStatus)) {
            return Future.failedFuture(this.realTimeStatus + ".cannot.be.started");
        }

        try {
            changeRealTimeStatus(RealTimeStatus.STARTING);

            if (isMultiCluster) {
                // Mode Redis multi-cluster
                redisService.start()
                        .onSuccess(futureVoid -> changeRealTimeStatus(RealTimeStatus.STARTED).onComplete(promise))
                        .onFailure(promise::fail);
            }
        } catch (Exception e) {
            String message = String.format("[Magneto@%s::start] Error starting collaboration service",
                    this.getClass().getSimpleName());
            log.error(message, e);
            changeRealTimeStatus(RealTimeStatus.ERROR).onComplete(promise);
        }

        return promise.future();
    }

    /**
     * Arrête le service collaboration
     */
    public Future<Void> stop() {
        Promise<Void> promise = Promise.promise();

        if (isMultiCluster && redisService != null) {
            redisService.stop().onComplete(promise);
        } else {
            cleanUp().onComplete(promise);
        }

        return promise.future().onComplete(e -> this.statusSubscribers.clear());
    }

    /**
     * Propage le message à tous les users (mode EventBus)
     */
    @Override
    public void onNewMessage(String receivedMessage) {
        try {
            JsonObject jsonMessage = new JsonObject(receivedMessage);

            // Ignorer les messages provenant de cette instance
            if (jsonMessage.containsKey("serverId") && serverId.equals(jsonMessage.getString("serverId"))) return;

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
                                String debugMessage = "[Magneto@%s::onNewMessage] Received collaboration message with metadata for board : %s";
                                log.debug(String.format(debugMessage, this.getClass().getSimpleName(), boardId));
                            }
                            catch (Exception e) {
                                String errorMessage = "[Magneto@%s::onNewMessage] Error processing collaboration metadata : %s";
                                log.error(String.format(errorMessage, this.getClass().getSimpleName(), e));
                            }
                        }
                    }
                    // Convertir en MagnetoMessageWrapper et notifier les abonnés
                    MagnetoMessageWrapper magnetoMessage = new MagnetoMessageWrapper(jsonMessage);

                    for (Handler<MagnetoMessageWrapper> messagesSubscriber : messagesSubscribers) {
                        try {
                            messagesSubscriber.handle(magnetoMessage);
                        } catch (Exception e) {
                            String errorMessage = "[Magneto@%s::onNewMessage] Error occurred while calling message subscriber : %s";
                            log.error(String.format(errorMessage, this.getClass().getSimpleName(), e));
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
    public void subscribeToStatusChanges(Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.add(subscriber);
    }

    @Override
    public void unsubscribeToStatusChanges(Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.remove(subscriber);
    }

    @Override
    public void subscribeToNewMessagesToSend(Handler<MagnetoMessageWrapper> handler) {
        this.messagesSubscribers.add(handler);
    }

    /**
     * Handle user action and call {@link #executeAction(MagnetoUserAction, String, String, UserInfos, boolean)}
     */
    @Override
    public Future<List<MagnetoMessage>> onNewUserAction(final MagnetoUserAction action, String boardId, String wsId, final UserInfos user, final boolean checkConcurency) {
        if (action == null) {
            log.warn("[Magneto@DefaultMagnetoCollaborationService::onNewUserAction] Message does not contain a type");
            return Future.failedFuture("wall.action.missing");
        }

        try {
            return action.isValid() ?
                    executeAction(action, boardId, wsId, user, checkConcurency) :
                    Future.failedFuture("magneto.action.invalid");
        }
        catch (Exception e) {
            return Future.failedFuture(e);
        }
    }

    /**
     * Interact with BDD according to the type of action
     */
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
                            updatedCard.setIsLiked(null);
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
            case sectionsUpdated: {
                SectionPayload firstSectionToUpdate = action.getSections().get(0);
                SectionPayload secondSectionToUpdate = action.getSections().get(1);
                return serviceFactory.sectionService().update(firstSectionToUpdate)
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateSection] Failed to update first section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .compose(res -> serviceFactory.sectionService().update(secondSectionToUpdate))
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateSection] Failed to update second section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                        })
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
            }
            case cardFavorite: {
                String cardId = action.getCardId();
                if(user == null){
                    BadRequestException noUser = new BadRequestException("User not found");
                    String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                            this.getClass().getSimpleName(), noUser.getMessage());
                    log.error(message);
                }
                return serviceFactory.cardService().updateFavorite(cardId, action.getIsMoving(), user, true)
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
                            String message = String.format("[Magneto@%s::deleteComment] Failed to delete comment",
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
                            String message = String.format("[Magneto@%s::editComment] Failed to edit comment",
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
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
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
            case sectionAddedWithCard: {
                String newId = UUID.randomUUID().toString();
                SectionPayload newSection = action.getSections().get(0);
                SectionPayload sectionToUpdate = action.getSections().get(1);
                return serviceFactory.sectionService().createSectionWithBoardUpdate(newSection, newId)
                        .compose(res -> serviceFactory.sectionService().update(sectionToUpdate))
                        .compose(res -> this.createBoardMessagesForUsers(boardId, wsId, user, action.getActionType()));
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

                return this.serviceFactory.cardService().processMoveCard(updateCard, oldBoardId, newBoardId, user, null)
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
            case cardEditionStarted: {
                final CollaborationUsersMetadata context = metadataByBoardId.computeIfAbsent(boardId, k -> new CollaborationUsersMetadata());
                context.getEditing().add(new CardEditingInformation(user.getUserId(), action.getCardId(), System.currentTimeMillis(), action.getIsMoving()));

                // Publier les métadonnées mises à jour si multi-cluster
                if (isMultiCluster && redisService != null) {
                    redisService.publishBoardMetadata(boardId)
                            .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::cardEditionStarted] Failed to publish metadata", err));
                }

                return Future.succeededFuture(newArrayList(
                        this.messageFactory.cardEditing(
                                boardId,
                                wsId,
                                user.getUserId(),
                                context.getEditing(),
                                this.maxConnectedUser
                        )));
            }
            case cardEditionEnded: {
                final CollaborationUsersMetadata context = metadataByBoardId.computeIfAbsent(boardId, k -> new CollaborationUsersMetadata());
                context.getEditing().removeIf(info -> info.getUserId().equals(user.getUserId()));

                // Publier les métadonnées mises à jour si multi-cluster
                if (isMultiCluster && redisService != null) {
                    redisService.publishBoardMetadata(boardId)
                            .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::cardEditionEnded] Failed to publish metadata", err));
                }

                return Future.succeededFuture(newArrayList(
                        this.messageFactory.cardEditing(
                                boardId,
                                wsId,
                                user.getUserId(),
                                context.getEditing(),
                                this.maxConnectedUser
                        )));
            }
        }
        return Future.succeededFuture(Collections.emptyList());
    }

    /**
     * Propage la liste de messages à tous les users
     */
    private void broadcastMessagesToUsers(final List<MagnetoMessage> messages,
                                          final boolean allowInternalMessages,
                                          final boolean allowExternalMessages,
                                          final String exceptWsId) {
        for (final Handler<MagnetoMessageWrapper> messagesSubscriber : this.messagesSubscribers) {
            try {
                messagesSubscriber.handle(new MagnetoMessageWrapper(messages, allowInternalMessages, allowExternalMessages, exceptWsId));
            } catch (Exception e) {
                log.error("[Magneto@DefaultMagnetoCollaborationService::broadcastMessagesToUsers] An error occurred while sending a message to users", e);
            }
        }
    }

    /**
     * Handle a user action and propagate it to all the users via {@link #broadcastMessagesToUsers(List, boolean, boolean, String)}
     */
    @Override
    public Future<List<MagnetoMessage>> pushEvent(final String boardId, final UserInfos session, final MagnetoUserAction action, final String wsId, final boolean checkConcurency) {
        return this.onNewUserAction(action, boardId, wsId, session, checkConcurency)
                .onSuccess(messages -> {
                    // Diffusion locale
                    switch (action.getType()) {
                        case ping:
                        case cardAdded:
                        case cardMoved:
                        case cardUpdated:
                            this.broadcastMessagesToUsers(messages, true, false, null);
                            break;
                        default:
                            this.broadcastMessagesToUsers(messages, true, false, null);
                    }

                    // Publication Redis si multi-cluster
                    if (isMultiCluster && redisService != null && !messages.isEmpty()) {
                        redisService.publishMessages(messages)
                                .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::pushEvent] Failed to publish to Redis", err));
                    }
                });
    }

    /**
     * Update context et metadata du board + publie un message pour prévenir les autres user de sa connection
     */
    @Override
    public Future<List<MagnetoMessage>> onNewConnection(String boardId, UserInfos user, final String wsId, Map<String, User> wsIdToUser) {
        return getBoardRights(boardId, user)
                .compose(rights -> {
                    // Récupérer ou créer le contexte local pour ce board
                    final CollaborationUsersMetadata localContext = metadataByBoardId.computeIfAbsent(boardId, k -> new CollaborationUsersMetadata());

                    if (isMultiCluster && redisService != null) {
                        // Récupérer le contexte global (avec tous les utilisateurs de tous les clusters)
                        return redisService.getBoardMetadata(boardId)
                                .compose(globalContext -> {
                                    // Assigner une couleur basée sur le contexte global
                                    UserColor assignedColor = assignColorToUser(boardId, globalContext);

                                    // Créer et ajouter l'utilisateur avec la couleur au contexte local
                                    User userWithColor = new User(user.getUserId(), user.getUsername(), rights, assignedColor);
                                    localContext.addConnectedUser(userWithColor);

                                    // Publier le contexte local avec l'utilisateur ayant sa couleur
                                    return redisService.publishBoardMetadata(boardId)
                                            .map(v -> buildMessages(boardId, wsId, user, userWithColor, globalContext, wsIdToUser));
                                });
                    } else {
                        // Mode mono-cluster : assigner une couleur basée sur le contexte local
                        UserColor assignedColor = assignColorToUser(boardId, localContext);
                        User userWithColor = new User(user.getUserId(), user.getUsername(), rights, assignedColor);

                        return Future.succeededFuture(buildMessages(boardId, wsId, user, userWithColor, localContext, wsIdToUser));
                    }
                });
    }

    private List<MagnetoMessage> buildMessages(String boardId, String wsId, UserInfos user, User userWithColor,
                                               CollaborationUsersMetadata context,
                                               Map<String, User> wsIdToUser) {
        wsIdToUser.put(wsId, userWithColor);
        context.addConnectedUser(userWithColor);

        // Créer les messages avec les métadonnées
        final MagnetoMessage newUserMessage = this.messageFactory.connection(boardId, wsId, user.getUserId());

        final MagnetoMessage connectedUsersMessage = this.messageFactory.connectedUsers(
                boardId, wsId, user.getUserId(), context.getConnectedUsers(), this.maxConnectedUser);

        final MagnetoMessage cardEditingMessage = this.messageFactory.cardEditing(
                boardId, wsId, user.getUserId(), context.getEditing(), this.maxConnectedUser);

        List<MagnetoMessage> messages = Arrays.asList(newUserMessage, connectedUsersMessage, cardEditingMessage);

        if (isMultiCluster && redisService != null) {
            // Publier les messages via Redis
            redisService.publishMessages(messages)
                    .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::buildMessages] Failed to publish messages to Redis", err));
        }

        return messages;
    }

    /**
     * Update context et metadata du board
     */
    @Override
    public Future<List<MagnetoMessage>> onNewDisconnection(String boardId, String userId, final String wsId) {
        final MagnetoMessage disconnectionMessage = this.messageFactory.disconnection(boardId, wsId, userId);
        final CollaborationUsersMetadata localContext = this.metadataByBoardId.get(boardId);

        if (localContext != null) {
            // Retirer l'utilisateur du contexte local
            localContext.removeConnectedUser(userId);
            localContext.getEditing().removeIf(info -> info.getUserId().equals(userId));
            if (isMultiCluster && redisService != null)
                redisService.publishBoardMetadata(boardId);
        }
        List<MagnetoMessage> messages = newArrayList(disconnectionMessage);
        if (isMultiCluster && redisService != null)
            return redisService.publishMessages(messages).map(messages);
        else
            return Future.succeededFuture(messages);
        /*
            // Si plus personne n'est connecté, on peut supprimer le contexte
            if (localContext.getConnectedUsers().isEmpty()) {
                metadataByBoardId.remove(boardId);
            }

            if (isMultiCluster && redisService != null) {
                // Publier les métadonnées mises à jour puis récupérer le contexte global
                return redisService.publishBoardMetadata(boardId)
                        .compose(v -> redisService.getBoardMetadata(boardId))
                        .map(globalContext -> {
                            final MagnetoMessage connectedUsersMessage = this.messageFactory.connectedUsers(
                                    boardId, wsId, userId, globalContext.getConnectedUsers(), this.maxConnectedUser);

                            final MagnetoMessage cardEditingMessage = this.messageFactory.cardEditing(
                                    boardId, wsId, userId, globalContext.getEditing(), this.maxConnectedUser);


                            messages.add(disconnectionMessage);
                            messages.add(connectedUsersMessage);
                            messages.add(cardEditingMessage);

                            // Publier les messages
                            redisService.publishMessages(messages)
                                    .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::onNewDisconnection] Failed to publish messages", err));

                            return messages;
                        })
                        .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::onNewDisconnection] Failed to publish to Redis", err));
            } else {
                // Mode mono-cluster : utiliser le contexte local
                final MagnetoMessage connectedUsersMessage = this.messageFactory.connectedUsers(
                        boardId, wsId, userId, localContext.getConnectedUsers(), this.maxConnectedUser);

                final MagnetoMessage cardEditingMessage = this.messageFactory.cardEditing(
                        boardId, wsId, userId, localContext.getEditing(), this.maxConnectedUser);

                List<MagnetoMessage> messages = new ArrayList<>();
                messages.add(disconnectionMessage);
                messages.add(connectedUsersMessage);
                messages.add(cardEditingMessage);

                return Future.succeededFuture(messages);
            }
        } else {
            // Si pas de contexte mais mode multi-cluster, publier quand même le message de déconnexion
            List<MagnetoMessage> messages = new ArrayList<>();
            messages.add(disconnectionMessage);

            if (isMultiCluster && redisService != null) {
                redisService.publishMessages(messages)
                        .onFailure(err -> log.error("[Magneto@DefaultMagnetoCollaborationService::onNewDisconnection] Failed to publish disconnection", err));
            }

            return Future.succeededFuture(messages);
        }*/
    }

    /**
     * Change RT status and propage information for everyone
     */
    private Future<Void> changeRealTimeStatus(RealTimeStatus realTimeStatus) {
        final Promise<Void> promise = Promise.promise();

        if (realTimeStatus == this.realTimeStatus) {
            promise.complete();
            return promise.future();
        }

        log.debug("[Magneto@DefaultMagnetoCollaborationService::changeRealTimeStatus] Changing real time status : " + this.realTimeStatus + " -> " + realTimeStatus);
        this.realTimeStatus = realTimeStatus;
        final Future<Void> cleanPromise;

        cleanPromise = realTimeStatus == RealTimeStatus.ERROR ? cleanUp() : Future.succeededFuture();
        cleanPromise.onComplete(e -> {
            for (Handler<RealTimeStatus> statusSubscriber : this.statusSubscribers) {
                try {
                    statusSubscriber.handle(this.realTimeStatus);
                }
                catch (Exception exc) {
                    log.error("[Magneto@DefaultMagnetoCollaborationService::changeRealTimeStatus] Error occurred while calling status change handler", exc);
                }
            }
            promise.complete();
        });

        return promise.future();
    }

    /**
     * Unregister from the EventBus when RT status is in error
     * @return
     */
    private Future<Void> cleanUp() {
        Promise<Void> promise = Promise.promise();
        try {
            if (eventBusConsumer != null) {
                eventBusConsumer.unregister(ar -> {
                    if (ar.succeeded()) {
                        promise.complete();
                    }
                    else {
                        promise.fail(ar.cause());
                    }
                });
            }
            else {
                promise.complete();
            }
        }
        catch (Exception e) {
            String errorMessage = "[Magneto@%s::cleanUp] Error during cleanup : %s";
            log.error(String.format(errorMessage, this.getClass().getSimpleName(), e));
            promise.fail(e);
        }
        return promise.future();
    }

    /**
     * Transform message as needed for a board creation action
     * @param boardId
     * @param wsId
     * @param user
     * @param actionType
     * @return
     */
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

    /**
     * Transform message as needed for a card favorite action
     * @param boardId
     * @param cardId
     * @param wsId
     * @param user
     * @param actionType
     * @return
     */
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



    // Repository functions

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
            if (OK.equals(res.body().getString(STATUS))) {
                boolean hasContrib = res.body().getInteger(COUNT, 0) > 0 && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD);
                promise.complete(hasContrib);
            } else {
                promise.complete(false);
            }
        });

        return promise.future();
    }

    public Future<UserBoardRights> getBoardRights(String boardId, UserInfos user) {
        Promise<UserBoardRights> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, boardId)
                .put(Field.DELETED, false);

        JsonObject projection = new JsonObject()
                .put(Field.OWNERID, 1)
                .put(Field.SHARED, 1);

        MongoDb.getInstance().findOne(CollectionsConstant.BOARD_COLLECTION, query, projection, res -> {
            if (OK.equals(res.body().getString(STATUS))) {
                JsonObject board = res.body().getJsonObject(RESULT);
                if (board != null) {
                    UserBoardRights rights = calculateRights(board, user);
                    promise.complete(rights);
                } else {
                    promise.complete(new UserBoardRights());
                }
            } else {
                promise.complete(new UserBoardRights());
            }
        });

        return promise.future();
    }

    // Redis

    @Override
    public Future<List<MagnetoMessage>> pushEventToAllUsers(final String boardId, final UserInfos session, final MagnetoUserAction action, final boolean checkConcurency) {
        return pushEvent(boardId, session, action, "", checkConcurency);
    }

    /**
     * Récupère le statut du service temps réel
     */
    @Override
    public RealTimeStatus getStatus() {
        return this.realTimeStatus;
    }

    /**
     * Récupère l'ID du serveur
     */
    public String getServerId() {
        return serverId;
    }
}