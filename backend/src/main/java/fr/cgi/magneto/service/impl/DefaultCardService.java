package fr.cgi.magneto.service.impl;

import com.mongodb.client.model.Filters;
import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.excpetion.BadRequestException;
import fr.cgi.magneto.excpetion.RessourceNotFoundException;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.Metadata;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.statistics.StatisticsPayload;
import fr.cgi.magneto.service.CardService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.WorkspaceService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.bson.conversions.Bson;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class DefaultCardService implements CardService {

    private final MongoDb mongoDb;

    private final String collection;
    private final WorkspaceService workspaceService;
    private final ServiceFactory serviceFactory;


    protected static final Logger log = LoggerFactory.getLogger(DefaultCardService.class);


    public DefaultCardService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.workspaceService = serviceFactory.workSpaceService();
        this.serviceFactory = serviceFactory;
    }

    @Override
    public Future<JsonObject> create(CardPayload card, String id) {
        Promise<JsonObject> promise = Promise.promise();
        mongoDb.insert(this.collection, card.toJson().put(Field._ID, id), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::create] Failed to create card", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    private Future<List<String>> createWithLocked(CardPayload card, String id, UserInfos user) {
        Promise<List<String>> promise = Promise.promise();

        SortedMap<Integer, String> sortedPositions = new TreeMap<>();
        List<Card> cards = new ArrayList<>();

        this.serviceFactory.boardService().getBoards(Collections.singletonList(card.getBoardId()))
                .compose(boards -> {
                    Board board = boards.get(0);
                    Promise<List<Card>> cardsPromise = Promise.promise();

                    if (board.isLayoutFree()) {
                        this.getAllCardsByBoard(board, 0, user, false)
                                .onSuccess(result -> cardsPromise.complete(result.getJsonArray(Field.ALL).getList()))
                                .onFailure(fail -> {
                                    String message = String.format("[Magneto@%s::getAllCardsByBoardId] Failed to get all cards",
                                            this.getClass().getSimpleName());
                                    log.error(message);
                                });
                    } else {
                        this.serviceFactory.sectionService().getSectionsByBoardId(board.getId())
                                .compose(sections -> {
                                    if (card.getSectionId() == null || sections.isEmpty()) {
                                        return Future.succeededFuture(new ArrayList<>());
                                    }
                                    Section section = sections.stream()
                                            .filter(s -> s.getId().equals(card.getSectionId()))
                                            .findFirst()
                                            .orElse(null);
                                    return this.fetchAllCardsBySection(section, 0, user);
                                })
                                .onSuccess(cardsPromise::complete)
                                .onFailure(cardsPromise::fail);
                    }

                    return cardsPromise.future()
                            .compose(cardsResult -> {
                                cards.addAll(cardsResult);
                                for (int i = 0; i < cards.size(); i++) {
                                    if (cards.get(i).isLocked()) {
                                        sortedPositions.put(i, cards.get(i).getId());
                                    }
                                }
                                return this.create(card, id);
                            })
                            .compose(createdCard -> {
                                List<String> notLockedCards = cards.stream()
                                        .filter(c -> !c.isLocked())
                                        .map(Card::getId)
                                        .collect(Collectors.toList());

                                notLockedCards.add(0, id);

                                sortedPositions.forEach((originalPosition, lockedCard) -> {
                                    if (originalPosition < notLockedCards.size()) {
                                        notLockedCards.add(originalPosition, lockedCard);
                                    } else {
                                        notLockedCards.add(lockedCard);
                                    }
                                });

                                return Future.succeededFuture(notLockedCards);
                            });
                })
                .onSuccess(promise::complete)
                .onFailure(error -> promise.fail(error.getMessage()));

        return promise.future();
    }

    private Future<List<String>> createMultipleWithLocked(List<CardPayload> cardPayloads, UserInfos user) {
        Promise<List<String>> promise = Promise.promise();

        // Validate input
        if (cardPayloads == null || cardPayloads.isEmpty()) {
            return Future.failedFuture("Card payloads list cannot be null or empty");
        }

        // All cards should be in the same board
        String boardId = cardPayloads.get(0).getBoardId();
        if (!cardPayloads.stream().allMatch(card -> card.getBoardId().equals(boardId))) {
            return Future.failedFuture("All cards must be duplicated to the same board");
        }

        SortedMap<Integer, String> sortedPositions = new TreeMap<>();
        List<Card> cards = new ArrayList<>();

        this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                    Board board = boards.get(0);
                    Promise<List<Card>> cardsPromise = Promise.promise();

                    if (board.isLayoutFree()) {
                        this.getAllCardsByBoard(board, 0, user, false)
                                .onSuccess(result -> cardsPromise.complete(result.getJsonArray(Field.ALL).getList()))
                                .onFailure(fail -> {
                                    String message = String.format("[Magneto@%s::getAllCardsByBoardId] Failed to get all cards",
                                            this.getClass().getSimpleName());
                                    log.error(message);
                                });
                    } else {
                        this.serviceFactory.sectionService().getSectionsByBoardId(board.getId())
                                .compose(sections -> this.fetchAllCardsBySection(sections.get(0), 0, user))
                                .onSuccess(cardsPromise::complete)
                                .onFailure(cardsPromise::fail);
                    }

                    return cardsPromise.future()
                            .compose(cardsResult -> {
                                cards.addAll(cardsResult);
                                for (int i = 0; i < cards.size(); i++) {
                                    if (cards.get(i).isLocked()) {
                                        sortedPositions.put(i, cards.get(i).getId());
                                    }
                                }

                                // Create a list to track future results for all card creation operations
                                List<Future> createFutures = cardPayloads.stream()
                                        .map(payload -> this.create(
                                                new CardPayload(payload).setId(null),
                                                payload.getId()
                                        ))
                                        .collect(Collectors.toList());

                                return CompositeFuture.all(createFutures);
                            })
                            .compose(createdCards -> {
                                List<String> notLockedCards = cards.stream()
                                        .filter(c -> !c.isLocked())
                                        .map(Card::getId)
                                        .collect(Collectors.toList());

                                // Add all newly created card IDs at the beginning
                                List<String> newCardIds = cardPayloads.stream()
                                        .map(CardPayload::getId)
                                        .collect(Collectors.toList());
                                notLockedCards.addAll(0, newCardIds);

                                // Restore locked cards to their original positions
                                sortedPositions.forEach((originalPosition, lockedCard) -> {
                                    if (originalPosition < notLockedCards.size()) {
                                        notLockedCards.add(originalPosition, lockedCard);
                                    } else {
                                        notLockedCards.add(lockedCard);
                                    }
                                });

                                return Future.succeededFuture(notLockedCards);
                            });
                })
                .onSuccess(promise::complete)
                .onFailure(error -> promise.fail(error.getMessage()));

        return promise.future();
    }

    @Override
    public void addCardWithLocked(CardPayload updateCard, List<Future> updateBoardsFutures, Board currentBoard, UserInfos user) {


        BoardPayload boardToUpdate = new BoardPayload()
                .setId(currentBoard.getId())
                .setCardIds(currentBoard.cards()
                        .stream()
                        .map(Card::getId)
                        .collect(Collectors.toList()))
                .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));


        this.getAllCardsByBoard(currentBoard, 0, user, false)
                .onSuccess(result -> {
                    List<Card> cards = result.getJsonArray(Field.ALL).getList();
                    SortedMap<Integer, String> sortedPositions = new TreeMap<>();
                    for (int i = 0; i < cards.size(); i++) {
                        if (cards.get(i).isLocked()) {
                            sortedPositions.put(i, cards.get(i).getId());
                        }
                    }
                    List<String> notLockedCards = cards.stream()
                            .filter(c -> !c.isLocked())
                            .map(Card::getId)
                            .collect(Collectors.toList());

                    notLockedCards.add(0, updateCard.getId());

                    sortedPositions.forEach((originalPosition, lockedCard) -> {
                        if (originalPosition < notLockedCards.size()) {
                            notLockedCards.add(originalPosition, lockedCard);
                        } else {
                            notLockedCards.add(lockedCard);
                        }
                    });

                    boardToUpdate.setCardIds(notLockedCards);

                    updateBoardsFutures.add(this.serviceFactory.boardService().update(boardToUpdate));

                })
                .onFailure(fail -> log.error("[Magneto@%s::addCardWithLocked] Failed to get board cards", this.getClass().getSimpleName(),
                        fail.getMessage()));
    }

    @Override
    public void removeCardWithLocked(JsonObject moveCard, Future<List<Board>> getOldBoardFuture, List<Future> updateBoardsFutures, UserInfos user) {
        BoardPayload boardToUpdate = new BoardPayload(getOldBoardFuture.result().get(0).toJson());
        boardToUpdate.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));

        this.getAllCardsByBoard(getOldBoardFuture.result().get(0), 0, user, false)
                .onSuccess(result -> {
                    List<Card> cards = result.getJsonArray(Field.ALL).getList();
                    SortedMap<Integer, String> sortedPositions = new TreeMap<>();
                    for (int i = 0; i < cards.size(); i++) {
                        if (cards.get(i).isLocked()) {
                            sortedPositions.put(i, cards.get(i).getId());
                        }
                    }
                    List<String> notLockedCards = cards.stream()
                            .filter(c -> !c.isLocked() && !c.getId().equals(moveCard.getJsonObject(Field.CARD).getString(Field.ID)))
                            .map(Card::getId)
                            .collect(Collectors.toList());

                    sortedPositions.forEach((originalPosition, lockedCard) -> {
                        if (originalPosition < notLockedCards.size()) {
                            notLockedCards.add(originalPosition, lockedCard);
                        } else {
                            notLockedCards.add(lockedCard);
                        }
                    });

                    boardToUpdate.setCardIds(notLockedCards);

                    updateBoardsFutures.add(this.serviceFactory.boardService().update(boardToUpdate));

                })
                .onFailure(fail -> log.error("[Magneto@%s::addCardWithLocked] Failed to get board cards", this.getClass().getSimpleName(),
                        fail.getMessage()));
    }

    @Override
    public void addCardSectionWithLocked(CardPayload updateCard, Future<List<Section>> getSectionFuture, List<Future> updateBoardsFutures,
                                         Board currentBoard, String defaultTitle, UserInfos user) {

        // Update modification date from board
        BoardPayload boardToUpdate = new BoardPayload()
                .setId(currentBoard.getId())
                .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));

        if (getSectionFuture.result().isEmpty()) {
            String newId = UUID.randomUUID().toString();
            SectionPayload sectionToCreate = new SectionPayload(currentBoard.getId())
                    .setTitle(defaultTitle)
                    .addCardIds(Collections.singletonList(updateCard.getId()));
            boardToUpdate.addSection(newId);
            updateBoardsFutures.add(this.serviceFactory.sectionService().create(sectionToCreate, newId));
        } else {
            this.fetchAllCardsBySection(getSectionFuture.result().get(0), 0, user)
                    .onSuccess(cards -> {
                        Section sectionToUpdate = getSectionFuture.result().get(0);
                        SortedMap<Integer, String> sortedPositions = new TreeMap<>();
                        for (int i = 0; i < cards.size(); i++) {
                            if (cards.get(i).isLocked()) {
                                sortedPositions.put(i, cards.get(i).getId());
                            }
                        }
                        List<String> notLockedCards = cards.stream()
                                .filter(c -> !c.isLocked())
                                .map(Card::getId)
                                .collect(Collectors.toList());

                        notLockedCards.add(0, updateCard.getId());

                        sortedPositions.forEach((originalPosition, lockedCard) -> {
                            if (originalPosition < notLockedCards.size()) {
                                notLockedCards.add(originalPosition, lockedCard);
                            } else {
                                notLockedCards.add(lockedCard);
                            }
                        });
                        sectionToUpdate = sectionToUpdate
                                .setId(currentBoard.sections().get(0).getId()) // no rights to remove all section, so we can always check get(0)
                                .setCardIds(notLockedCards);
                        updateBoardsFutures.add(this.serviceFactory.sectionService().update(new SectionPayload(sectionToUpdate.toJson())));
                    })
                    .onFailure(fail -> log.error("[Magneto@%s::addCardSectionWithLocked] Failed to get section cards", this.getClass().getSimpleName(),
                            fail.getMessage()));
        }

        updateBoardsFutures.add(this.serviceFactory.boardService().update(boardToUpdate));
    }

    @Override
    public void removeCardSectionWithLocked(CardPayload updateCard, String oldBoardId, Future<List<Section>> getOldSectionFuture, List<Future> updateBoardsFutures,
                                            Board currentBoard, UserInfos user) {

        // Update modification date from board
        BoardPayload boardToUpdate = new BoardPayload()
                .setId(currentBoard.getId())
                .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));

        Section sectionToUpdate = getOldSectionFuture.result()
                .stream()
                .filter(section -> section.getCardIds().contains(updateCard.getId()))
                .findFirst()
                .orElse(null);
        if (sectionToUpdate != null) {

            this.fetchAllCardsBySection(sectionToUpdate, 0, user)
                    .onSuccess(cards -> {
                        SortedMap<Integer, String> sortedPositions = new TreeMap<>();
                        for (int i = 0; i < cards.size(); i++) {
                            if (cards.get(i).isLocked()) {
                                sortedPositions.put(i, cards.get(i).getId());
                            }
                        }
                        List<String> notLockedCards = cards.stream()
                                .filter(c -> !c.isLocked() && !c.getId().equals(updateCard.getId()))
                                .map(Card::getId)
                                .collect(Collectors.toList());

                        sortedPositions.forEach((originalPosition, lockedCard) -> {
                            if (originalPosition < notLockedCards.size()) {
                                notLockedCards.add(originalPosition, lockedCard);
                            } else {
                                notLockedCards.add(lockedCard);
                            }
                        });
                        sectionToUpdate.setCardIds(notLockedCards);
                        updateBoardsFutures.add(this.serviceFactory.sectionService().update(new SectionPayload(sectionToUpdate.toJson())));
                        updateBoardsFutures.add(this.serviceFactory.boardService().update(boardToUpdate));
                    })
                    .onFailure(fail -> log.error("[Magneto@%s::addCardSectionWithLocked] Failed to get section cards", this.getClass().getSimpleName(),
                            fail.getMessage()));
        } else {
            updateBoardsFutures.add(Future.failedFuture(String.format("[Magneto%s::moveCard] " +
                    "No section found with for board with id %s", this.getClass().getSimpleName(), oldBoardId)));
        }
    }

    @Override
    public void deleteCardsWithLocked(List<String> cardIds, Future<List<Section>> getSectionFuture, Board currentBoard, List<Future> removeCardsFutures, UserInfos user) {
        // Remove cards from board
        BoardPayload boardToUpdate = new BoardPayload()
                .setId(currentBoard.getId())
                .setPublic(currentBoard.isPublic())
                .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));

        this.getAllCardsByBoard(currentBoard, 0, user, false)
                .onSuccess(result -> {
                    List<Card> cards = result.getJsonArray(Field.ALL).getList();
                    SortedMap<Integer, String> sortedPositions = new TreeMap<>();
                    for (int i = 0; i < cards.size(); i++) {
                        if (cards.get(i).isLocked() && !cardIds.contains(cards.get(i).getId())) {
                            sortedPositions.put(i, cards.get(i).getId());
                        }
                    }
                    List<String> notLockedCards = cards.stream()
                            .filter(c -> !c.isLocked() && !cardIds.contains(c.getId()))
                            .map(Card::getId)
                            .collect(Collectors.toList());

                    sortedPositions.forEach((originalPosition, lockedCard) -> {
                        if (originalPosition < notLockedCards.size()) {
                            notLockedCards.add(originalPosition, lockedCard);
                        } else {
                            notLockedCards.add(lockedCard);
                        }
                    });

                    boardToUpdate.setCardIds(notLockedCards);

                    removeCardsFutures.add(this.serviceFactory.boardService().update(boardToUpdate));

                })
                .onFailure(fail -> log.error("[Magneto@%s::addCardWithLocked] Failed to get board cards", this.getClass().getSimpleName(),
                        fail.getMessage()));

        // Remove cards from section
        if (!getSectionFuture.result().isEmpty()) {
            getSectionFuture.result().forEach((section) -> {
                if (section.getCardIds().stream().anyMatch(cardIds::contains)) {
                    this.fetchAllCardsBySection(section, 0, user)
                            .onSuccess(cards -> {
                                SortedMap<Integer, String> sortedPositions = new TreeMap<>();
                                for (int i = 0; i < cards.size(); i++) {
                                    if (cards.get(i).isLocked() && !cardIds.contains(cards.get(i).getId())) {
                                        sortedPositions.put(i, cards.get(i).getId());
                                    }
                                }
                                List<String> notLockedCards = cards.stream()
                                        .filter(c -> !c.isLocked() && !cardIds.contains(c.getId()))
                                        .map(Card::getId)
                                        .collect(Collectors.toList());

                                sortedPositions.forEach((originalPosition, lockedCard) -> {
                                    if (originalPosition < notLockedCards.size()) {
                                        notLockedCards.add(originalPosition, lockedCard);
                                    } else {
                                        notLockedCards.add(lockedCard);
                                    }
                                });
                                SectionPayload sectionPayload = new SectionPayload(section.toJson())
                                        .setCardIds(notLockedCards);

                                removeCardsFutures.add(this.serviceFactory.sectionService().update(sectionPayload));
                            })
                            .onFailure(fail -> log.error("[Magneto@%s::addCardSectionWithLocked] Failed to get section cards", this.getClass().getSimpleName(),
                                    fail.getMessage()));
                }
            });
        }
    }

    @Override
    public Future<JsonObject> createCardLayout(CardPayload cardPayload, I18nHelper i18n, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        String newId = UUID.randomUUID().toString();

        Future<List<String>> createCardFuture = this.createWithLocked(cardPayload, newId, user);
        Future<List<Board>> getBoardFuture = this.serviceFactory.boardService().getBoards(Collections.singletonList(cardPayload.getBoardId()));
        Future<List<Section>> getSectionsFuture = this.serviceFactory.sectionService().getSectionsByBoardId(cardPayload.getBoardId());
        Future<JsonObject> syncDocumentRightsFuture = this.syncDocumentRights(cardPayload.getBoardId(),
                cardPayload.getResourceId(), cardPayload.getOwnerId());

        List<Future> createCardFutures = new ArrayList<>();
        CompositeFuture.all(createCardFuture, getBoardFuture, getSectionsFuture, syncDocumentRightsFuture)
                .compose(result -> {
                    if (!getBoardFuture.result().isEmpty() && result.succeeded()) {
                        BoardPayload boardPayload = new BoardPayload(getBoardFuture.result().get(0).toJson());

                        // Check if layout is free = We add cards directly in cardIds property of board
                        if (boardPayload.isLayoutFree()) {
                            boardPayload.setCardIds(createCardFuture.result());
                        } else {
                            if (cardPayload.getSectionId() != null && !getSectionsFuture.result().isEmpty()) {
                                // If layout is section = We update the section selected, and we add new card id into it
                                Section updatedSection = getSectionsFuture.result()
                                        .stream()
                                        .filter(section -> section.getId().equals(cardPayload.getSectionId()))
                                        .findFirst()
                                        .orElse(null);
                                if (updatedSection != null) {
                                    SectionPayload updateSection = new SectionPayload(updatedSection.toJson());
                                    updateSection.setCardIds(createCardFuture.result());
                                    createCardFutures.add(this.serviceFactory.sectionService().update(updateSection));
                                } else {
                                    String message = String.format("[Magneto%s::createCardLayout] " +
                                            "No card found with id %s", this.getClass().getSimpleName(), newId);
                                    promise.fail(message);
                                    return Future.failedFuture(message);
                                }
                            } else {
                                SectionPayload createSection = new SectionPayload(boardPayload.getId())
                                        .setTitle(i18n != null ? i18n.translate("magneto.section.default.title") : Field.DEFAULTTITLE);
                                createSection.addCardIds(Collections.singletonList(newId));
                                String newSectionId = UUID.randomUUID().toString();
                                boardPayload.addSection(newSectionId);
                                createCardFutures.add(this.serviceFactory.sectionService().create(createSection, newSectionId));
                            }
                        }
                        createCardFutures.add(this.updateBoard(boardPayload));
                        return CompositeFuture.all(createCardFutures);
                    } else {
                        String message = String.format("[Magneto%s::createCardLayout] " +
                                "No card found with id %s", this.getClass().getSimpleName(), newId);
                        promise.fail(message);
                        return Future.failedFuture(message);
                    }
                })
                .onFailure(promise::fail)
                .onSuccess(success -> promise.complete(new JsonObject().put(Field.ID, newId)));

        return promise.future();
    }

    private Future<JsonObject> syncDocumentRights(String boardId, String documentId, String cardOwnerId) {
        Promise<JsonObject> promise = Promise.promise();
        this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .onFailure(promise::fail)
                .onSuccess(boards -> {
                    if (!boards.isEmpty()) {
                        Board board = boards.get(0);
                        String boardOwnerId = board.getOwnerId();
                        JsonObject shared = WorkspaceHelper.toAPIShareFormat(board.getShared(), cardOwnerId.equals(boardOwnerId), boardOwnerId);
                        this.workspaceService.setShareRights(Collections.singletonList(documentId), shared)
                                .onFailure(promise::fail)
                                .onSuccess(success -> promise.complete(shared));
                    } else {
                        String message = String.format("[Magneto@%s::syncDocumentRights] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId);
                        promise.fail(message);
                    }
                });
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(CardPayload card) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, card.getId());
        JsonObject update = new JsonObject().put(Mongo.SET, card.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::update] Failed to update card", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(new JsonObject().put(Field.ID, card.getId()));
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> updateAndReturnPayload(CardPayload card) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, card.getId());
        JsonObject update = new JsonObject().put(Mongo.SET, card.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::update] Failed to update card", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(card.toJson());
        }));
        return promise.future();
    }

    @Override
    public Future<CompositeFuture> deleteCardsWithBoardValidation(List<String> cardIds, String boardId, UserInfos user) {
        Future<List<Board>> getBoardFuture = this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId));
        Future<List<Section>> getSectionFuture = this.serviceFactory.sectionService().getSectionsByBoardId(boardId);

        return CompositeFuture.all(getBoardFuture, getSectionFuture)
                .compose(result -> {
                    if (!getBoardFuture.result().isEmpty()) {
                        Board currentBoard = getBoardFuture.result().get(0);
                        List<Future> removeCardsFutures = new ArrayList<>();

                        this.deleteCardsWithLocked(cardIds, getSectionFuture, currentBoard, removeCardsFutures, user);
                        removeCardsFutures.add(this.deleteCards(cardIds));
                        return CompositeFuture.all(removeCardsFutures);
                    } else {
                        return Future.failedFuture(String.format("[Magneto%s::deleteCards] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId));
                    }
                });
    }

    @Override
    public Future<JsonObject> deleteCards(List<String> cardIds) {
        return this.deleteCards(null, cardIds);
    }

    @Override
    public Future<JsonObject> deleteCards(String userId, List<String> cardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(cardIds)));
        if (userId != null)
            query.put(Field.OWNERID, userId);

        mongoDb.delete(this.collection, query, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteCards] Failed to delete cards",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteCardsByBoards(List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field.BOARDID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)));
        mongoDb.delete(this.collection, query, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteCardsByBoards] Failed to delete cards by board ids",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllCards(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, boolean isFavorite, String searchText, String sortBy) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCardsCount(user, boardId, page, isPublic, isShared, isFavorite, searchText, sortBy, true);
        Future<List<Card>> fetchAllCardsFuture = fetchAllCards(user, boardId, page, isPublic, isShared, isFavorite, searchText, sortBy);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .compose(success -> setMetadataCards(fetchAllCardsFuture.result()))
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCards] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(cards -> {
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.PAGE, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });
        return promise.future();
    }

    @Override
    public Future<List<Card>> getCardsOrFirstSection(Board board, UserInfos user){
        if (board.isLayoutFree()) {
            return this.serviceFactory.cardService().getAllCardsByBoard(board, user);
        } else {
            return this.serviceFactory.sectionService().getSectionsByBoardId(board.getId())
                    .compose(sections -> {
                        if (sections.isEmpty()) {
                            return Future.succeededFuture(new ArrayList<>());
                        }
                        Section section = sections.stream()
                                .filter(s -> s.getId().equals(board.getSectionIds().get(0)))
                                .findFirst()
                                .orElse(null);
                        return this.fetchAllCardsBySection(section, 0, user);
                    });
        }
    }

    @Override
    public Future<List<Card>> getCards(List<String> cardIds, UserInfos user) {
        Promise<List<Card>> promise = Promise.promise();
        getCardsRequest(cardIds, user)
                .compose(cards -> {
                    List<Card> cardList = ModelHelper.toList(cards.getJsonObject(Field.CURSOR, new JsonObject())
                            .getJsonArray(Field.FIRSTBATCH, new JsonArray()), Card.class);
                    return setMetadataCards(cardList);
                })
                .onFailure(promise::fail)
                .onSuccess(cards -> {
                    if (cards.isEmpty()) {
                        promise.fail(String.format("[Magneto%s::getCards] No cards found", this.getClass().getSimpleName()));
                    } else {
                        promise.complete(cards);
                    }
                });
        return promise.future();
    }

    private Future<JsonObject> getCardsRequest(List<String> cardIds, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();

        String userId = user.getUserId();

        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field._ID, new JsonObject().put(Mongo.IN, cardIds)))
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.CAPTION, 1)
                        .put(Field.DESCRIPTION, 1)
                        .put(Field.ISLOCKED, 1)
                        .put(Field.OWNERID, 1)
                        .put(Field.OWNERNAME, 1)
                        .put(Field.RESOURCETYPE, 1)
                        .put(Field.RESOURCEID, 1)
                        .put(Field.RESOURCEURL, 1)
                        .put(Field.CREATIONDATE, 1)
                        .put(Field.MODIFICATIONDATE, 1)
                        .put(Field.BOARDID, 1)
                        .put(Field.PARENTID, 1)
                        .put(Field.LASTMODIFIERID, 1)
                        .put(Field.LASTMODIFIERNAME, 1)
                        .put(Field.LASTCOMMENT, new JsonObject()
                                .put(Mongo.ARRAYELEMAT, new JsonArray().add("$" + Field.COMMENTS).add(-1)))
                        .put(Field.NBOFCOMMENTS, new JsonObject()
                                .put(Mongo.$COND, new JsonObject()
                                        .put(Mongo.IF, new JsonObject()
                                                .put(Mongo.ISARRAY, String.format("$%s", Field.COMMENTS)))
                                        .put(Mongo.THEN, new JsonObject()
                                                .put(Mongo.SIZE, String.format("$%s", Field.COMMENTS)))
                                        .put(Mongo.ELSE, 0)))
                        .put(Field.NBOFFAVORITES, new JsonObject()
                                .put(Mongo.$COND, new JsonObject()
                                        .put(Mongo.IF, new JsonObject()
                                                .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                        .put(Mongo.THEN, new JsonObject()
                                                .put(Mongo.SIZE, String.format("$%s", Field.FAVORITELIST)))
                                        .put(Mongo.ELSE, 0)))
                        .put(Field.ISLIKED, new JsonObject()
                                .put(Mongo.$COND, new JsonObject()
                                        .put(Mongo.IF, new JsonObject()
                                                .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                        .put(Mongo.THEN, new JsonObject()
                                                .put(Mongo.$SET_ISSUBSET, new JsonArray().add(new JsonArray().add(userId)).add(String.format("$%s", Field.FAVORITELIST))))
                                        .put(Mongo.ELSE, false)))
                        .put(Field.FAVORITE_LIST, 1))
                .getAggregate();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                String.format("[Magneto@%s::getCardsRequest] Failed to get cards request", this.getClass().getSimpleName()))));
        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllCardsByBoard(Board board, Integer page, UserInfos user, boolean fromStartPage) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCardsByBoardCount(board, page, user);

        Future<List<Card>> fetchAllCardsFuture = fetchAllCardsByBoard(board, page, user, fromStartPage, null);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .compose(success -> setMetadataCards(fetchAllCardsFuture.result()))
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(cards -> {
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.PAGE, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });


        return promise.future();
    }

    @Override
    public Future<List<Card>> getAllCardsByBoard(Board board, UserInfos user) {
        return this.getAllCardsByBoard(board, user, null);
    }

    @Override
    public Future<List<Card>> getAllCardsByBoard(Board board, UserInfos user, UserInfos userToFetch) {
        Promise<List<Card>> promise = Promise.promise();

        fetchAllCardsByBoard(board, null, user, true, userToFetch)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(promise::complete);


        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllCardsBySection(Section section, Integer page, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllCardsCountFuture = fetchAllCardsBySectionCount(section, page, user);

        Future<List<Card>> fetchAllCardsFuture = fetchAllCardsBySection(section, page, user);


        CompositeFuture.all(fetchAllCardsFuture, fetchAllCardsCountFuture)
                .compose(success -> setMetadataCards(fetchAllCardsFuture.result()))
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(cards -> {
                    int cardsCount = (fetchAllCardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllCardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, cards)
                            .put(Field.PAGE, cardsCount)
                            .put(Field.PAGECOUNT, cardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(cardsCount / (double) Magneto.PAGE_SIZE)));
                });


        return promise.future();
    }

    @Override
    public Future<List<Card>> getAllCardsBySectionSimple(Section section, Integer page, UserInfos user) {
        Promise<List<Card>> promise = Promise.promise();

        fetchAllCardsBySection(section, page, user)
                .compose(this::setMetadataCards)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllCardsBySectionSimple] Failed to get section cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(promise::complete);
        
        return promise.future();
    }

    public Future<List<Card>> getAllCardsByCreationDate(StatisticsPayload statisticsPayload) {
        Promise<List<Card>> promise = Promise.promise();

        Pattern datePattern = Pattern.compile("^" + statisticsPayload.getDate());
        Bson matcher = Filters.regex(Field.CREATIONDATE, datePattern);
        mongoDb.find(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::get] Failed to get cards by creation date", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(ModelHelper.toList(results.right().getValue(), Card.class));
        }));
        return promise.future();
    }

    public Future<JsonObject> duplicateCards(String boardId, List<Card> cards, SectionPayload section, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boardResult -> {
                    if (!boardResult.isEmpty()) {
                        return duplicateCardsFuture(boardId, cards, section, boardResult.get(0), user);
                    } else {
                        return Future.failedFuture(String.format("[Magneto%s::duplicateCards] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId));
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(promise::fail);
        return promise.future();
    }

    public Future<JsonObject> duplicateSection(String boardId, List<Card> cards, SectionPayload section, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boardResult -> {
                    if (!boardResult.isEmpty()) {
                        return duplicateSectionFuture(boardId, cards, section, boardResult.get(0), user);
                    } else {
                        return Future.failedFuture(String.format("[Magneto%s::duplicateCards] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId));
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(promise::fail);
        return promise.future();
    }

    public Future<JsonObject> updateBoard(BoardPayload board) {
        if (board == null) {
            String message = String.format("[Magneto@%s::updateBoard] Failed to update board",
                    this.getClass().getSimpleName());
            return Future.failedFuture(message);
        }
        return this.serviceFactory.boardService().update(board);
    }

    public Future<JsonObject> updateFavorite(String cardId, boolean favorite, UserInfos user, boolean returnPayload) {
        Promise<JsonObject> promise = Promise.promise();
        String userId = user.getUserId();
        if (cardId == null || userId == null) {
            promise.fail(new RessourceNotFoundException("User or card does not exist"));
            return promise.future();
        }

        getCards(Collections.singletonList(cardId), user)
                .compose(cards -> {
                    if (!cards.isEmpty()) {
                        Card card = cards.get(0);
                        List<String> favoriteList = card.getFavoriteList();
                        if (!favorite) {
                            if (!favoriteList.contains(userId)) {
                                favoriteList.add(userId);
                            } else {
                                return Future.failedFuture(new BadRequestException("User already in favorite list, you can't add it"));
                            }
                        } else {
                            if (favoriteList.contains(userId)) {
                                favoriteList.remove(userId);
                            } else {
                                return Future.failedFuture(new BadRequestException("User not in favorite list, you can't remove it"));
                            }
                        }
                        card.setFavoriteList(favoriteList);
                        // Update card in database
                        CardPayload cardPayload = new CardPayload(card.toJson());
                        cardPayload.setId(cardId);
                        return returnPayload ? updateAndReturnPayload(cardPayload) : update(cardPayload);
                    } else {
                        return Future.failedFuture("No card found with id " + cardId);
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(promise::fail);
        return promise.future();
    }


    private Future<JsonObject> duplicateCardsFuture(String boardId, List<Card> cards, SectionPayload section, Board boardResult, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        List<CardPayload> cardPayloads = new ArrayList<>();
        for (Card card : cards) {
            cardPayloads.add(createPayloadForDuplication(boardId, card, user));
        }

        createMultipleWithLocked(cardPayloads, user)
                .compose(result -> {
                    BoardPayload boardPayload = new BoardPayload(boardResult.toJson());

                    // Check if board layout is free = we duplicate cards directly in the board
                    if (boardPayload.isLayoutFree()) {
                        boardPayload.setCardIds(result);
                        return this.updateBoard(boardPayload);
                    } else {
                        // If board layout is section = we retrieve the first section, or we take the section given in parameters,
                        // and we add cards in the section
                        return this.serviceFactory.sectionService().getSectionsByBoardId(boardId)
                                .compose(sections -> {
                                    SectionPayload sectionToUpdate = new SectionPayload();
                                    if (section != null) {
                                        sectionToUpdate = section;
                                        sectionToUpdate.setCardIds(result);
                                        return this.serviceFactory.sectionService().update(sectionToUpdate);
                                    } else {
                                        Section firstSection = sections
                                                .stream()
                                                .filter(sectionResult -> sectionResult.getId().equals(boardPayload.getSectionIds().get(0)))
                                                .findFirst()
                                                .orElse(null);
                                        if (firstSection != null) {
                                            firstSection.setCardIds(result);
                                            return this.serviceFactory.sectionService().update(new SectionPayload(firstSection.toJson()));
                                        } else {
                                            String message = String.format("[Magneto@%s::duplicateCardsFuture] Failed to duplicate card in section : no sections found",
                                                    this.getClass().getSimpleName());
                                            return Future.failedFuture(message);
                                        }
                                    }
                                });
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::duplicateCardsFuture] Failed to duplicate cards : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    promise.fail(message);
                });
        return promise.future();
    }

    private Future<JsonObject> duplicateSectionFuture(String boardId, List<Card> cards, SectionPayload section, Board boardResult, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        List<Future> duplicateFutures = new ArrayList<>();
        for (Card card : cards) {
            duplicateFutures.add(sectionDuplicationCard(boardId, card, user));
        }

        CompositeFuture.all(duplicateFutures)
                .compose(result -> {
                    BoardPayload boardPayload = new BoardPayload(boardResult.toJson());
                    List<String> newCardIds = new ArrayList<>();
                    for (Future duplicateFuture : duplicateFutures) {
                        newCardIds.add(String.valueOf(duplicateFuture.result()));
                    }

                    // Check if board layout is free = we duplicate cards directly in the board
                    if (boardPayload.isLayoutFree()) {
                        boardPayload.addCards(newCardIds);
                        return this.updateBoard(boardPayload);
                    } else {
                        // If board layout is section = we retrieve the first section, or we take the section given in parameters,
                        // and we add cards in the section
                        return this.serviceFactory.sectionService().getSectionsByBoardId(boardId)
                                .compose(sections -> {
                                    SectionPayload sectionToUpdate = new SectionPayload();
                                    if (section != null) {
                                        sectionToUpdate = section;
                                        sectionToUpdate.addCardIds(newCardIds);
                                        return this.serviceFactory.sectionService().update(sectionToUpdate);
                                    } else {
                                        Section firstSection = sections
                                                .stream()
                                                .filter(sectionResult -> sectionResult.getId().equals(boardPayload.getSectionIds().get(0)))
                                                .findFirst()
                                                .orElse(null);
                                        if (firstSection != null) {
                                            firstSection.addCardIds(newCardIds);
                                            return this.serviceFactory.sectionService().update(new SectionPayload(firstSection.toJson()));
                                        } else {
                                            String message = String.format("[Magneto@%s::duplicateCardsFuture] Failed to duplicate card in section : no sections found",
                                                    this.getClass().getSimpleName());
                                            return Future.failedFuture(message);
                                        }
                                    }
                                });
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::duplicateCardsFuture] Failed to duplicate cards : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    promise.fail(message);
                });
        return promise.future();
    }

    private Future<String> sectionDuplicationCard(String boardId, Card card, UserInfos user) {
        Promise<String> promise = Promise.promise();
        CardPayload cardPayload = new CardPayload(card.toJson());
        String newId = UUID.randomUUID().toString();
        cardPayload.setId(null);
        cardPayload.setOwnerId(user.getUserId());
        cardPayload.setOwnerName(user.getUsername());
        cardPayload.setBoardId(boardId);
        cardPayload.setParentId(card.getId());
        cardPayload.setFavoriteList(new ArrayList<>());
        this.create(cardPayload, newId)
                .compose(createCardResult -> {
                    promise.complete(newId);
                    return Future.succeededFuture();
                });
        return promise.future();
    }

    private CardPayload createPayloadForDuplication(String boardId, Card card, UserInfos user) {
        CardPayload cardPayload = new CardPayload(card.toJson());
        String newId = UUID.randomUUID().toString();
        cardPayload.setId(newId);
        cardPayload.setOwnerId(user.getUserId());
        cardPayload.setOwnerName(user.getUsername());
        cardPayload.setBoardId(boardId);
        cardPayload.setParentId(card.getId());
        cardPayload.setFavoriteList(new ArrayList<>());
        return cardPayload;
    }

    private Future<List<Card>> setMetadataCards(List<Card> cards) {
        Promise<List<Card>> promise = Promise.promise();
        Future<Void> current = Future.succeededFuture();
        for (Card card : cards) {
            current = current.compose(v -> setMetadataCard(card));
        }
        current
                .onSuccess(res -> promise.complete(cards))
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::setMetadataCards] Failed to fetch metadata : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    promise.fail(message);
                });
        return promise.future();
    }

    private Future<Void> setMetadataCard(Card card) {
        Promise<Void> promise = Promise.promise();
        if (card.getResourceId() != null && !Objects.equals(card.getResourceId(), "")) {
            workspaceService.getDocument(card.getResourceId())
                    .onSuccess(document -> {
                        if (document.containsKey(Field._ID) && !document.containsKey(Field.RESULT)) {
                            card.setMetadata(new Metadata(document.getJsonObject(Field.METADATA)
                                    .put(Field.FILEOWNER, document.getString(Field.OWNERNAME))));
                        }
                        promise.complete();
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::setMetadataCard] Failed to get document : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        promise.fail(message);
                    });
        } else {
            promise.complete();
        }
        return promise.future();
    }

    /**
     * Fetch all cards by board
     * @param board the board
     * @param page the page
     * @param user the user who fetches the cards
     * @param fromStartPage if true, we fetch the first page of cards
     * @param userToFetch if defined, we fetch cards of this user
     * @return the list of cards
     */
    private Future<List<Card>> fetchAllCardsByBoard(Board board, Integer page, UserInfos user,
                                                    boolean fromStartPage, UserInfos userToFetch) {
        Promise<List<Card>> promise = Promise.promise();
        JsonObject query = this.getAllCardsByBoardQuery(board, page, false, user, fromStartPage, userToFetch);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error(String.format("[Magneto@%s::fetchAllCardsByBoard] Failed to get cards", this.getClass().getSimpleName()),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Card.class));
            }
        }));
        return promise.future();
    }

    private Future<JsonArray> fetchAllCardsByBoardCount(Board board, Integer page, UserInfos user) {
        Promise<JsonArray> promise = Promise.promise();
        JsonObject query = this.getAllCardsByBoardQuery(board, page, true, user, false);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsByBoardCount] Failed to get cards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result);
            }
        }));
        return promise.future();
    }

    private Future<List<Card>> fetchAllCardsBySection(Section section, Integer page, UserInfos user) {
        Promise<List<Card>> promise = Promise.promise();
        JsonObject query = this.getAllCardsBySectionQuery(section, page, false, user);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error(String.format("[Magneto@%s::fetchAllCardsBySection] Failed to get cards", this.getClass().getSimpleName()),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Card.class));
            }
        }));
        return promise.future();
    }

    private Future<JsonArray> fetchAllCardsBySectionCount(Section section, Integer page, UserInfos user) {
        Promise<JsonArray> promise = Promise.promise();
        JsonObject query = this.getAllCardsBySectionQuery(section, page, true, user);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsBySectionCount] Failed to get cards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result);
            }
        }));
        return promise.future();
    }

    private Future<List<Card>> fetchAllCards(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, boolean isFavorite, String searchText,
                                             String sortBy) {

        Promise<List<Card>> promise = Promise.promise();

        JsonObject query = this.getAllCardsQuery(user, boardId, page, isPublic, isShared, isFavorite, searchText, sortBy, false);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCards] Failed to get cards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Card.class));
            }
        }));

        return promise.future();
    }

    private Future<JsonArray> fetchAllCardsCount(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, boolean isFavorite, String searchText,
                                                 String sortBy, boolean getCount) {

        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = this.getAllCardsQuery(user, boardId, page, isPublic, isShared, isFavorite, searchText, sortBy, getCount);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsByCount] Failed to get cards with count", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result);
            }
        }));

        return promise.future();
    }

    private JsonObject getAllCardsQuery(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared,
                                        boolean isFavorite, String searchText, String sortBy, boolean getCount) {

        MongoQuery query = new MongoQuery(this.collection);
        if (boardId != null && !boardId.isEmpty()) {
            query.match(new JsonObject()
                    .put(Field.BOARDID, new JsonObject()
                            .put(Mongo.NE, boardId)));
        }
        query.lookUp(CollectionsConstant.BOARD_COLLECTION, Field.BOARDID, Field._ID, Field.RESULT)
                .matchRegex(searchText, Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.CAPTION,
                        String.format("%s.%s", Field.RESULT, Field.TAGS), String.format("%s.%s", Field.RESULT, Field.TITLE)))
                .addFields(Field.ISLIKED, new JsonObject()
                        .put(Mongo.$COND, new JsonObject()
                                .put(Mongo.IF, new JsonObject()
                                        .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                .put(Mongo.THEN, new JsonObject()
                                        .put(Mongo.$SET_ISSUBSET, new JsonArray()
                                                .add(new JsonArray().add(user.getUserId()))
                                                .add(String.format("$%s", Field.FAVORITELIST))))
                                .put(Mongo.ELSE, false)));
        if (isShared) {
            query.matchOr(new JsonArray()
                    .add(new JsonObject()
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, Field.USERID),
                                    new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId())))
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
                    .add(new JsonObject()
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, Field.GROUPID),
                                    new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
            );
        } else if (isPublic) {
            query.match(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.PUBLIC), true));
        } else if (isFavorite) {
            query.matchOr(new JsonArray()
                    .add(new JsonObject()
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, Field.USERID),
                                    new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId())))
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
                    .add(new JsonObject()
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, Field.GROUPID),
                                    new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                            .put(String.format("%s.%s.%s", Field.RESULT, Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initContribRight"), true))
                    .add(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.PUBLIC), true))
                    .add(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.OWNERID), user.getUserId()))
            );
            query.match(new JsonObject().put(Field.ISLIKED, true));
        } else {
            query.match(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.OWNERID), user.getUserId()));
        }
        List<String> groupField = Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.CAPTION, Field.RESOURCEID, Field.RESOURCETYPE, Field.RESOURCEURL);
        List<String> externalGroupField = Arrays.asList(Field.PARENTID, Field._ID, Field.CREATIONDATE, Field.BOARDID,
                Field.MODIFICATIONDATE, Field.OWNERID, Field.OWNERNAME, Field.LASTMODIFIERID, Field.LASTMODIFIERNAME, Field.RESULT, Field.FAVORITELIST, Field.ISLIKED);
        Map<String, String> fieldAccumulators = new HashMap<>();
        for (String field : externalGroupField) {
            fieldAccumulators.put(field, field.equals(Field.ISLIKED) ? Mongo.MAX : Mongo.FIRST);
        }
        query
                .match(new JsonObject().put(String.format("%s.%s", Field.RESULT, Field.DELETED), false))
                .sort(Field.PARENTID, 1)
                .group(groupField, fieldAccumulators);
        if (sortBy != null && !sortBy.isEmpty()) {
            switch (sortBy) {
                case Field.FAVORITE:
                    query.sort(Field.ISLIKED, -1);
                    break;
                default:
                    break;
            }
        } else {
            query.sort(String.format("%s.%s", Field.RESULT, Field.MODIFICATIONDATE), -1);
        }

        if (getCount) {
            query = query.count();
        } else {
            query
                    .page(page)
                    .project(new JsonObject()
                            .put(Field._ID, String.format("$%s", Field.ID))
                            .put(Field.TITLE, String.format("$%s.%s", Field._ID, Field.TITLE))
                            .put(Field.CAPTION, String.format("$%s.%s", Field._ID, Field.CAPTION))
                            .put(Field.DESCRIPTION, String.format("$%s.%s", Field._ID, Field.DESCRIPTION))
                            .put(Field.RESOURCETYPE, String.format("$%s.%s", Field._ID, Field.RESOURCETYPE))
                            .put(Field.RESOURCEID, String.format("$%s.%s", Field._ID, Field.RESOURCEID))
                            .put(Field.RESOURCEURL, String.format("$%s.%s", Field._ID, Field.RESOURCEURL))
                            .put(Field.CREATIONDATE, 1)
                            .put(Field.MODIFICATIONDATE, 1)
                            .put(Field.OWNERID, 1)
                            .put(Field.OWNERNAME, 1)
                            .put(Field.LASTMODIFIERID, 1)
                            .put(Field.LASTMODIFIERNAME, 1)
                            .put(Field.BOARDTITLE, query.arrayElemAt(String.format("%s.%s", Field.RESULT, Field.TITLE), 0))
                            .put(Field.BOARDID, 1)
                            .put(Field.FAVORITE_LIST, 1)
                            .put(Field.NBOFFAVORITES, new JsonObject()
                                    .put(Mongo.$COND, new JsonObject()
                                            .put(Mongo.IF, new JsonObject()
                                                    .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                            .put(Mongo.THEN, new JsonObject()
                                                    .put(Mongo.SIZE, String.format("$%s", Field.FAVORITELIST)))
                                            .put(Mongo.ELSE, 0)))
                            .put(Field.ISLIKED, 1)
                    );
        }
        return query.getAggregate();
    }

    /**
     * Get all cards by board
     * @param board the board
     * @param page the page
     * @param getCount if true, return the count of cards
     * @param user the user who requests the cards
     * @param fromStartPage if true, return the cards from the start page
     * @param userToFetch if defined, only return the cards of the user
     * @return the query to get all cards by board
     */
    private JsonObject getAllCardsByBoardQuery(Board board, Integer page, boolean getCount, UserInfos user,
                                               boolean fromStartPage, UserInfos userToFetch) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.BOARDID, board.getId()));

        if (userToFetch != null) {
            query.match(new JsonObject()
                    .put(Field.OWNERID, userToFetch.getUserId()));
        }

        if (page != null) {
            JsonArray cardIds = new JsonArray(board.cards().stream().map(Card::getId).collect(Collectors.toList()));
            query.match(new JsonObject().put(Field._ID, new JsonObject().put(Mongo.IN, cardIds)))
                    .addFields(Field.INDEX, new JsonObject()
                            .put(Mongo.INDEX_OF_ARRAY, new JsonArray()
                                    .add(cardIds)
                                    .add('$' + Field._ID)
                            )
                    )
                    .sort(Field.INDEX, 1);
        }
        if (getCount) {
            query.count();
        } else {
            if (page != null) {
                if (fromStartPage){
                    query.pageFromStart(page);
                }else {
                    query.page(page);
                }
            }

            JsonObject q = new JsonObject()
                    .put(Field._ID, 1)
                    .put(Field.TITLE, 1)
                    .put(Field.CAPTION, 1)
                    .put(Field.DESCRIPTION, 1)
                    .put(Field.OWNERID, 1)
                    .put(Field.OWNERNAME, 1)
                    .put(Field.RESOURCETYPE, 1)
                    .put(Field.RESOURCEID, 1)
                    .put(Field.RESOURCEURL, 1)
                    .put(Field.CREATIONDATE, 1)
                    .put(Field.MODIFICATIONDATE, 1)
                    .put(Field.BOARDID, 1)
                    .put(Field.PARENTID, 1)
                    .put(Field.ISLOCKED, 1)
                    .put(Field.LASTMODIFIERID, 1)
                    .put(Field.LASTMODIFIERNAME, 1)
                    .put(Field.FAVORITE_LIST, 1)
                    .put(Field.LASTCOMMENT, new JsonObject()
                            .put(Mongo.ARRAYELEMAT, new JsonArray().add("$" + Field.COMMENTS).add(-1)))
                    .put(Field.NBOFCOMMENTS, new JsonObject()
                            .put(Mongo.$COND, new JsonObject()
                                    .put(Mongo.IF, new JsonObject()
                                            .put(Mongo.ISARRAY, String.format("$%s", Field.COMMENTS)))
                                    .put(Mongo.THEN, new JsonObject()
                                            .put(Mongo.SIZE, String.format("$%s", Field.COMMENTS)))
                                    .put(Mongo.ELSE, 0)))
                    .put(Field.NBOFFAVORITES, new JsonObject()
                            .put(Mongo.$COND, new JsonObject()
                                    .put(Mongo.IF, new JsonObject()
                                            .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                    .put(Mongo.THEN, new JsonObject()
                                            .put(Mongo.SIZE, String.format("$%s", Field.FAVORITELIST)))
                                    .put(Mongo.ELSE, 0)));
                    if (user != null)
                        q.put(Field.ISLIKED, new JsonObject()
                            .put(Mongo.$COND, new JsonObject()
                                    .put(Mongo.IF, new JsonObject()
                                            .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                    .put(Mongo.THEN, new JsonObject()
                                            .put(Mongo.$SET_ISSUBSET, new JsonArray().add(new JsonArray().add(user.getUserId())).add(String.format("$%s", Field.FAVORITELIST))))
                                    .put(Mongo.ELSE, false)));

            query.project(q);
        }

        return query.getAggregate();
    }

    private JsonObject getAllCardsByBoardQuery(Board board, Integer page, boolean getCount, UserInfos user,
                                               boolean fromStartPage) {
        return getAllCardsByBoardQuery(board, page, getCount, user, fromStartPage, null);
    }

    private JsonObject getAllCardsBySectionQuery(Section section, Integer page, boolean getCount, UserInfos user) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field.BOARDID, section.getBoardId()))
                .match(new JsonObject().put(Field._ID, new JsonObject().put(Mongo.IN, section.getCardIds())))
                .addFields(Field.INDEX, new JsonObject()
                        .put(Mongo.INDEX_OF_ARRAY, new JsonArray()
                                .add(section.getCardIds())
                                .add('$' + Field._ID)
                        )
                )
                .sort(Field.INDEX, 1);
        if (getCount) {
            query.count();
        } else {
            if (page != null)
                query.page(page);
            JsonObject q = new JsonObject()
                    .put(Field._ID, 1)
                    .put(Field.TITLE, 1)
                    .put(Field.CAPTION, 1)
                    .put(Field.DESCRIPTION, 1)
                    .put(Field.ISLOCKED, 1)
                    .put(Field.OWNERID, 1)
                    .put(Field.OWNERNAME, 1)
                    .put(Field.RESOURCETYPE, 1)
                    .put(Field.RESOURCEID, 1)
                    .put(Field.RESOURCEURL, 1)
                    .put(Field.CREATIONDATE, 1)
                    .put(Field.MODIFICATIONDATE, 1)
                    .put(Field.BOARDID, 1)
                    .put(Field.PARENTID, 1)
                    .put(Field.LASTMODIFIERID, 1)
                    .put(Field.LASTMODIFIERNAME, 1)
                    .put(Field.FAVORITE_LIST, 1)
                    .put(Field.LASTCOMMENT, new JsonObject()
                            .put(Mongo.ARRAYELEMAT, new JsonArray().add("$" + Field.COMMENTS).add(-1)))
                    .put(Field.NBOFCOMMENTS, new JsonObject()
                            .put(Mongo.$COND, new JsonObject()
                                    .put(Mongo.IF, new JsonObject()
                                            .put(Mongo.ISARRAY, String.format("$%s", Field.COMMENTS)))
                                    .put(Mongo.THEN, new JsonObject()
                                            .put(Mongo.SIZE, String.format("$%s", Field.COMMENTS)))
                                    .put(Mongo.ELSE, 0)))
                    .put(Field.NBOFFAVORITES, new JsonObject()
                            .put(Mongo.$COND, new JsonObject()
                                    .put(Mongo.IF, new JsonObject()
                                            .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                    .put(Mongo.THEN, new JsonObject()
                                            .put(Mongo.SIZE, String.format("$%s", Field.FAVORITELIST)))
                                    .put(Mongo.ELSE, 0)));
                    if (user != null){
                        q.put(Field.ISLIKED, new JsonObject()
                                .put(Mongo.$COND, new JsonObject()
                                        .put(Mongo.IF, new JsonObject()
                                                .put(Mongo.ISARRAY, String.format("$%s", Field.FAVORITELIST)))
                                        .put(Mongo.THEN, new JsonObject()
                                                .put(Mongo.$SET_ISSUBSET, new JsonArray().add(new JsonArray().add(user.getUserId())).add(String.format("$%s", Field.FAVORITELIST))))
                                        .put(Mongo.ELSE, false)));
                    }
            query.project(q);
        }

        return query.getAggregate();
    }
}
