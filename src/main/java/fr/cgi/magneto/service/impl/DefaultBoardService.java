package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.service.*;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.stream.Collectors;

public class DefaultBoardService implements BoardService {

    private final MongoDb mongoDb;
    private final String collection;
    private final FolderService folderService;
    private final SectionService sectionService;
    private final CardService cardService;

    protected static final Logger log = LoggerFactory.getLogger(DefaultBoardService.class);


    public DefaultBoardService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.folderService = serviceFactory.folderService();
        this.cardService = serviceFactory.cardService();
        this.sectionService = serviceFactory.sectionService();
    }

    @Override
    public Future<JsonObject> create(UserInfos user, JsonObject board, boolean defaultSection, I18nHelper i18n) {
        Promise<JsonObject> promise = Promise.promise();
        BoardPayload createBoard = new BoardPayload(board);
        String newId = UUID.randomUUID().toString();
        List<Future> createBoardFutures = new ArrayList<>();
        // Create new section and update board if layout is different of free
        if (!createBoard.isLayoutFree() && defaultSection) {
            String newSectionId = UUID.randomUUID().toString();
            createBoard.setSectionIds(Collections.singletonList(newSectionId));
            SectionPayload createSection = new SectionPayload(newId)
                    .setTitle(i18n.translate("magneto.section.default.title"));
            createBoardFutures.add(this.sectionService.create(createSection, newSectionId));
        }
        createBoard.setOwnerId(user.getUserId());
        createBoard.setOwnerName(user.getUsername());
        createBoardFutures.add(this.createBoard(createBoard, newId));
        CompositeFuture.all(createBoardFutures)
                .compose(success -> this.updateFolderOnBoardCreate(user.getUserId(), createBoard, newId))
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete(new JsonObject().put(Field.ID, newId)));
        return promise.future();
    }

    private Future<JsonObject> createBoard(BoardPayload board, String id) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject newBoard = board.toJson().put(Field._ID, id);
        mongoDb.insert(this.collection, newBoard, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::createBoard] Failed to create board", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    private Future<JsonObject> updateFolderOnBoardCreate(String ownerId, BoardPayload board, String boardId) {

        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, board.getFolderId())
                .put(Field.OWNERID, ownerId);
        JsonObject update = new JsonObject()
                .put(Mongo.PUSH, new JsonObject()
                        .put(Field.BOARDIDS, boardId));
        mongoDb.update(CollectionsConstant.FOLDER_COLLECTION, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateFolderOnBoardCreate] " +
                        "Failed to update folder", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(BoardPayload board) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, board.getId());
        JsonObject update = new JsonObject().put(Mongo.SET, board.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::update] Failed to update board", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue());
        }));
        return promise.future();
    }

    @SuppressWarnings("unchecked")
    public Future<JsonObject> duplicate(String boardId, UserInfos user, I18nHelper i18n) {
        Promise<JsonObject> promise = Promise.promise();
        Map<String, Future<?>> futures = new HashMap<>();
        JsonObject futuresInfos = new JsonObject();
        this.getBoards(Collections.singletonList(boardId))
                .compose(boardResult -> {
                    if (!boardResult.isEmpty()) {
                        Board duplicateBoard = boardResult.get(0);

                        // Store board infos for scope
                        futuresInfos.put(Field.BOARD, duplicateBoard.toJson());

                        Future<JsonObject> getCardsFuture;
                        Future<List<Section>> getSectionsFuture = Future.succeededFuture(); // Succeeded by default because not necessary everytime

                        // If the layout is different from Free, we get sections from the board
                        if (!duplicateBoard.isLayoutFree()) {
                            getSectionsFuture = sectionService.getSectionsByBoardId(duplicateBoard.getId());
                            futures.put(Field.SECTION, getSectionsFuture);
                        }

                        // Get all cards from the board
                        getCardsFuture = cardService.getAllCardsByBoard(duplicateBoard, null, user);
                        futures.put(Field.CARDS, getCardsFuture);

                        // Reset new board
                        duplicateBoard.reset();
                        Future<JsonObject> createBoardFuture = this.create(user, duplicateBoard.toJson(), false, i18n);
                        futures.put(Field.BOARD, createBoardFuture);
                        return CompositeFuture.all(getCardsFuture, getSectionsFuture, createBoardFuture);
                    } else {
                        String message = String.format("[Magneto%s::duplicate] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId);
                        promise.fail(message);
                        return Future.failedFuture(message);
                    }
                })
                .compose(result -> {
                    if (result.succeeded()) {
                        String duplicateBoard = ((JsonObject) futures.get(Field.BOARD).result()).getString(Field.ID);

                        JsonArray duplicateCardsArray = ((JsonObject) futures.get(Field.CARDS).result()).getJsonArray(Field.ALL);
                        List<Card> duplicateCards = duplicateCardsArray.getList();
                        List<Future> duplicateFuture = new ArrayList<>();

                        // Check if layout of the board to duplicate is not free
                        if (!futuresInfos.getJsonObject(Field.BOARD).getString(Field.LAYOUTTYPE).equals(Field.FREE)) {
                            List<Section> duplicateSection = (List<Section>) futures.get(Field.SECTION).result();

                            List<String> duplicateSectionIds = futuresInfos
                                    .getJsonObject(Field.BOARD, new JsonObject())
                                    .getJsonArray(Field.SECTIONIDS, new JsonArray())
                                    .getList();

                            duplicateSection.sort(Comparator.comparing(section-> duplicateSectionIds.indexOf(section.getId())));

                            // If no section in board, no duplicate
                            if (duplicateSection.isEmpty()) {
                                duplicateFuture.add(Future.succeededFuture((JsonObject) futures.get(Field.BOARD).result()));
                            } else {
                                duplicateFuture.add(sectionService.duplicateSections(duplicateBoard, duplicateSection, duplicateCards, true, user));
                            }
                        } else {
                            // If no cards in board, no duplicate
                            if (duplicateCards.isEmpty()) {
                                duplicateFuture.add(Future.succeededFuture((JsonObject) futures.get(Field.BOARD).result()));
                            } else {
                                List<String> duplicateCardIds = futuresInfos
                                        .getJsonObject(Field.BOARD)
                                        .getJsonArray(Field.CARDIDS)
                                        .getList();
                                duplicateCards.sort(Comparator.comparing(card -> duplicateCardIds.indexOf(card.getId())));
                                duplicateFuture.add(cardService.duplicateCards(duplicateBoard, duplicateCards, null, user));
                            }
                        }
                        return CompositeFuture.all(duplicateFuture);
                    } else {
                        String message = String.format("[Magneto%s::duplicate] " +
                                "Failed to retrieve cards/sections from board with id %s", this.getClass().getSimpleName(), boardId);
                        promise.fail(message);
                        return Future.failedFuture(message);
                    }
                })
                .onFailure(promise::fail)
                .onSuccess(success -> promise.complete());
        return promise.future();
    }

    public Future<JsonObject> updateLayoutCards(BoardPayload updateBoard, Board currentBoard, I18nHelper i18n, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        List<Future> updateBoardFutures = new ArrayList<>();

        // Check if we are changing the layout from free to section
        if (currentBoard.isLayoutFree() && !updateBoard.isLayoutFree()) {
            SectionPayload sectionPayload = new SectionPayload(updateBoard.getId()).setCardIds(currentBoard.cardIds());

            String sectionId = UUID.randomUUID().toString();
            sectionPayload.setTitle(i18n.translate("magneto.section.default.title"));
            updateBoard.addSection(sectionId);
            updateBoard.setCardIds(new ArrayList<>());
            updateBoardFutures.add(sectionService.create(sectionPayload, sectionId));
            promise.complete(updateBoard.toJson());

            // Check if we are changing the layout from section to free
        } else if (!currentBoard.isLayoutFree() && updateBoard.isLayoutFree()) {
            cardService.getAllCardsByBoard(currentBoard, null, user)
                    .compose(cards -> {
                        List<Card> cardsList = cards.getJsonArray(Field.ALL).getList();
                        List<String> cardIds = cardsList.stream().map(Card::getId).collect(Collectors.toList());
                        updateBoard.setCardIds(cardIds);
                        updateBoardFutures.add(sectionService.deleteByBoards(Collections.singletonList(updateBoard.getId())));
                        updateBoard.setSectionIds(new ArrayList<>());
                        promise.complete(updateBoard.toJson());
                        return Future.succeededFuture();
                    });
        } else {
            promise.complete(updateBoard.toJson());
        }
        return promise.future();
    }

    @Override
    public Future<JsonObject> preDeleteBoards(String userId, List<String> boardIds, boolean restore) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)))
                .put(Field.OWNERID, userId);
        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject().put(Field.DELETED, !restore));
        mongoDb.update(this.collection, query, update, false, true, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::preDeleteBoards] Failed to pre delete boards",
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
    public Future<JsonObject> delete(String userId, List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        this.deleteBoards(userId, boardIds)
                .compose(success -> {
                    Future<JsonObject> deleteSectionsFuture = this.sectionService.deleteByBoards(boardIds);
                    Future<JsonObject> updateFolderFuture = this.folderService.updateOldFolder(boardIds);
                    return CompositeFuture.all(deleteSectionsFuture, updateFolderFuture);
                })
                .onFailure(promise::fail)
                .onSuccess(success -> promise.complete(new JsonObject().put(Field.STATUS, Field.OK)));

        return promise.future();
    }

    private Future<JsonObject> deleteBoards(String userId, List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)))
                .put(Field.OWNERID, userId);
        mongoDb.delete(this.collection, query, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteBoards] Failed to delete boards",
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
    public Future<List<Board>> getBoards(List<String> boardIds) {
        Promise<List<Board>> promise = Promise.promise();
        JsonObject query = this.getBoardByIds(boardIds);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getBoards] Failed to get boards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Board.class));
            }
        }));

        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllBoards(UserInfos user, Integer page,
                                           String searchText, String folderId,
                                           boolean isPublic,
                                           boolean isShared, boolean isDeleted, String sortBy) {

        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllBoardsFuture = fetchAllBoards(user, page, searchText, folderId, isPublic, isShared,
                isDeleted, sortBy, false);

        Future<JsonArray> fetchAllBoardsCountFuture = fetchAllBoards(user, page, searchText, folderId,
                isPublic, isShared, isDeleted, sortBy, true);

        CompositeFuture.all(fetchAllBoardsFuture, fetchAllBoardsCountFuture)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllBoards] Failed to get boards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(success -> {
                    JsonArray boards = fetchAllBoardsFuture.result();
                    int boardsCount = (fetchAllBoardsCountFuture.result().isEmpty()) ? 0 :
                            fetchAllBoardsCountFuture.result().getJsonObject(0).getInteger(Field.COUNT);
                    promise.complete(new JsonObject()
                            .put(Field.ALL, boards)
                            .put(Field.PAGE, boardsCount)
                            .put(Field.PAGECOUNT, boardsCount <= Magneto.PAGE_SIZE ?
                                    0 : (long) Math.ceil(boardsCount / (double) Magneto.PAGE_SIZE)));
                });
        return promise.future();
    }

    private Future<JsonArray> fetchAllBoards(UserInfos user, Integer page,
                                             String searchText, String folderId,
                                             boolean isPublic, boolean isShared, boolean isDeleted,
                                             String sortBy, boolean getCount) {

        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = this.getAllBoardsQuery(user, page, searchText, folderId, isPublic, isShared,
                isDeleted, sortBy, getCount);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllBoards] Failed to get boards", this.getClass().getSimpleName(),
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

    @Override
    public Future<List<Board>> getAllBoardsEditable(UserInfos user) {

        Promise<List<Board>> promise = Promise.promise();

        JsonObject query = this.getAllBoardsEditableQuery(user);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getAllBoardsEditable] Failed to get boards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Board.class));
            }
        }));

        return promise.future();
    }

    private JsonObject getAllBoardsQuery(UserInfos user, Integer page,
                                         String searchText, String folderId,
                                         boolean isPublic, boolean isShared, boolean isDeleted,
                                         String sortBy, boolean getCount) {

        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.DELETED, isDeleted));

        if (isPublic) {
            query.match(new JsonObject()
                    .put(Field.PUBLIC, true));
        } else {
            if (isShared) {
                query.matchOr(new JsonArray()
                        .add(new JsonObject().put(Field.OWNERID, user.getUserId()))
                        .add(new JsonObject()
                                .put(String.format("%s.%s", Field.SHARED, Field.USERID), new JsonObject().put(Mongo.IN,
                                        new JsonArray().add(user.getUserId()))))
                        .add(new JsonObject()
                                .put(String.format("%s.%s", Field.SHARED, Field.GROUPID), new JsonObject().put(Mongo.IN, user.getGroupsIds()))));
            } else {
                query.match(new JsonObject().put(Field.OWNERID, user.getUserId()));
            }
        }

        query.matchRegex(searchText, Arrays.asList(Field.TITLE, Field.DESCRIPTION, Field.TAGS))
                .sort(sortBy, -1)
                .lookUp(CollectionsConstant.FOLDER_COLLECTION, Field._ID, Field.BOARDIDS, Field.FOLDERS)
                .lookUp(CollectionsConstant.SECTION_COLLECTION, Field.SECTIONIDS, Field._ID, Field.SECTIONS)
                .addFields(Field.NBCARDSSECTIONS, new JsonObject().put(Mongo.SUM, new JsonObject().put(
                                        Mongo.MAP, new JsonObject()
                                                .put(Mongo.INPUT, String.format("$%s", Field.SECTIONS))
                                                .put(Mongo.AS, Field.SECTION)
                                                .put(Mongo.IN_MAP, new JsonObject().put(Mongo.SIZE, String.format("$$%s.%s", Field.SECTION, Field.CARDIDS)))
                                )
                        )
                );

        if (!getCount) {
            if (page != null) {
                query.page(page);
            }
            query.project(new JsonObject()
                            .put(Field._ID, 1)
                            .put(Field.TITLE, 1)
                            .put(Field.IMAGEURL, 1)
                            .put(Field.BACKGROUNDURL, 1)
                            .put(Field.LAYOUTTYPE, 1)
                            .put(Field.NBCARDS, new JsonObject().put(Mongo.SIZE, String.format("$%s", Field.CARDIDS)))
                            .put(Field.NBCARDSSECTIONS, 1)
                            .put(Field.MODIFICATIONDATE, 1)
                            .put(Field.FOLDERID, new JsonObject().put(Mongo.FILTER,
                                    new JsonObject()
                                            .put(Mongo.INPUT, String.format("$%s", Field.FOLDERS))
                                            .put(Mongo.AS, Field.FOLDER)
                                            .put(Mongo.COND,
                                                    new JsonObject().put(Mongo.AND, new JsonArray()
                                                            .add(new JsonObject().put(Mongo.EQ, new JsonArray()
                                                                    .add(String.format("$$%s.%s", Field.FOLDER, Field.OWNERID))
                                                                    .add(user.getUserId())))
                                                            .add(new JsonObject().put(Mongo.EQ, new JsonArray()
                                                                    .add(String.format("$$%s.%s", Field.FOLDER, Field.DELETED))
                                                                    .add(String.format("$%s", Field.DELETED))))))
                            ))
                            .put(Field.DESCRIPTION, 1)
                            .put(Field.OWNERID, 1)
                            .put(Field.OWNERNAME, 1)
                            .put(Field.SHARED, 1)
                            .put(Field.TAGS, 1)
                            .put(Field.PUBLIC, 1)
                            .put(Field.DELETED, 1)
                            .put(Field.CANCOMMENT, 1)
                            .put(Field.DISPLAY_NB_FAVORITES, 1)
                    )
                    .unwind(Field.FOLDERID, true);
        }

        // If user searches a term, remove folder filter
        if (searchText == null || searchText.isEmpty()) {
            if (folderId != null || isDeleted) {
                query.match(new JsonObject().put(String.format("%s.%s", Field.FOLDERID, Field._ID), folderId));
            } else {
                query.match(new JsonObject().putNull(String.format("%s.%s", Field.FOLDERID, Field._ID)));
            }
        }

        query.project(new JsonObject()
                .put(Field._ID, 1)
                .put(Field.TITLE, 1)
                .put(Field.IMAGEURL, 1)
                .put(Field.BACKGROUNDURL, 1)
                .put(Field.NBCARDS, 1)
                .put(Field.NBCARDSSECTIONS, 1)
                .put(Field.MODIFICATIONDATE, 1)
                .put(Field.FOLDERID, String.format("$%s.%s", Field.FOLDERID, Field._ID))
                .put(Field.DESCRIPTION, 1)
                .put(Field.OWNERID, 1)
                .put(Field.OWNERNAME, 1)
                .put(Field.SHARED, 1)
                .put(Field.TAGS, 1)
                .put(Field.LAYOUTTYPE, 1)
                .put(Field.PUBLIC, 1)
                .put(Field.CANCOMMENT, 1)
                .put(Field.DISPLAY_NB_FAVORITES, 1));
        if (getCount) {
            query = query.count();
        }

        return query.getAggregate();
    }

    private JsonObject getAllBoardsEditableQuery(UserInfos user) {

        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.DELETED, false));

        query.matchOr(new JsonArray()
                .add(new JsonObject().put(Field.OWNERID, user.getUserId()))
                .add(new JsonObject()
                        .put(String.format("%s.%s", Field.SHARED, Field.USERID),
                                new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId())))
                        .put(String.format("%s.%s", Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initPublishRight"), true))
                .add(new JsonObject()
                        .put(String.format("%s.%s", Field.SHARED, Field.GROUPID),
                                new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                        .put(String.format("%s.%s", Field.SHARED, "fr-cgi-magneto-controller-ShareBoardController|initPublishRight"), true))
        );
        query.project(new JsonObject()
                .put(Field._ID, 1)
                .put(Field.TITLE, 1)
                .put(Field.IMAGEURL, 1)
                .put(Field.BACKGROUNDURL, 1)
                .put(Field.OWNERNAME, 1));
        return query.getAggregate();
    }

    private JsonObject getBoardByIds(List<String> boardIds) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds))))
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.IMAGEURL, 1)
                        .put(Field.BACKGROUNDURL, 1)
                        .put(Field.CREATIONDATE, 1)
                        .put(Field.SECTIONIDS, 1)
                        .put(Field.CARDIDS, 1)
                        .put(Field.LAYOUTTYPE, 1)
                        .put(Field.MODIFICATIONDATE, 1)
                        .put(Field.DESCRIPTION, 1)
                        .put(Field.OWNERID, 1)
                        .put(Field.OWNERNAME, 1)
                        .put(Field.SHARED, 1)
                        .put(Field.TAGS, 1)
                        .put(Field.PUBLIC, 1)
                        .put(Field.CANCOMMENT, 1)
                        .put(Field.DISPLAY_NB_FAVORITES, 1));
        return query.getAggregate();
    }
}
