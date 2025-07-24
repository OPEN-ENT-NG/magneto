package fr.cgi.magneto.service.impl;

import com.mongodb.client.model.Filters;
import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.core.enums.EventBusActions;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.share.SharedElem;
import fr.cgi.magneto.model.statistics.StatisticsPayload;
import fr.cgi.magneto.service.*;
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
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.share.ShareNormalizer;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.ResourceUtils;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class DefaultBoardService implements BoardService {

    private final MongoDb mongoDb;
    private final String collection;
    private final FolderService folderService;
    private final SectionService sectionService;
    private final CardService cardService;
    private final ShareNormalizer shareNormalizer;

    private final ShareService shareService;
    private final ServiceFactory serviceFactory;

    protected static final Logger log = LoggerFactory.getLogger(DefaultBoardService.class);


    public DefaultBoardService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.folderService = serviceFactory.folderService();
        this.cardService = serviceFactory.cardService();
        this.sectionService = serviceFactory.sectionService();
        this.shareService = serviceFactory.shareService();
        this.shareNormalizer = serviceFactory.shareNormalizer();
        this.serviceFactory = serviceFactory;
    }

    public Optional<UserInfos> getCreatorForModel(final JsonObject json) {
        if(!json.containsKey(Field.OWNERID)){
            return Optional.empty();
        }
        final UserInfos user = new UserInfos();
        user.setUserId(json.getString(Field.OWNERID));
        user.setUsername(json.getString(Field.OWNERNAME));
        return Optional.of(user);
    }

    private JsonObject addNormalizedShares(final JsonObject board) {
        try {
            if(board != null) {
                this.shareNormalizer.addNormalizedRights(board, e -> getCreatorForModel(e).map(UserInfos::getUserId));
            }
            return board;
        }
        catch (Exception e) {
            log.error(String.format("[Magneto@%s::addNormalizedShares] Failed to apply normalized shares : %s", this.getClass().getSimpleName(), e.getMessage()));
            return board;
        }
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
        if (createBoard.getFolderId() != null) {
            shareService.getOldDataToUpdate(createBoard.getFolderId(), CollectionsConstant.FOLDER_COLLECTION)
                    .onSuccess(s -> {
                        createBoard.setShared(s.getJsonArray(Field.SHARED, new JsonArray()));
                        handleCreateComposite(user, createBoardFutures, createBoard, newId, promise);
                    })
                    .onFailure(error -> promise.fail(error.getMessage()));
        } else {
            handleCreateComposite(user, createBoardFutures, createBoard, newId, promise);
        }

        return promise.future();
    }

    private void handleCreateComposite(UserInfos user, List<Future> createBoardFutures, BoardPayload createBoard, String newId, Promise<JsonObject> promise) {
        createBoardFutures.add(this.createBoard(createBoard, newId));

        CompositeFuture.all(createBoardFutures)
                .compose(success -> this.updateFolderOnBoardCreate(user.getUserId(), createBoard, newId))
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete(new JsonObject().put(Field.ID, newId)));
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
                .put(Field._ID, board.getFolderId());
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

    @Override
    public Future<Board> getBoardWithContent(String boardId, UserInfos user, Boolean isReadOnly) {
        return this.getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                    if (boards.isEmpty()) {
                        return Future.failedFuture(String.format("No board found with id %s", boardId));
                    }

                    Board board = boards.get(0);

                    if (board.isLayoutFree()) {
                        // Layout libre : récupérer toutes les cartes du board
                        return serviceFactory.cardService().getAllCardsByBoard(board, user)
                                .map(cards -> {
                                    board.setCards(cards);
                                    return board;
                                });
                    } else {
                        // Layout avec sections : récupérer les sections avec leurs cartes
                        return serviceFactory.sectionService().getSectionsByBoard(board, isReadOnly)
                                .compose(sections -> {
                                    List<Future> cardFutures = sections.stream()
                                            .map(section -> serviceFactory.cardService().getAllCardsBySectionSimple(section, null, user))
                                            .collect(Collectors.toList());

                                    return CompositeFuture.all(cardFutures)
                                            .map(result -> {
                                                List<Section> sectionsWithCards = sections.stream()
                                                        .map(section -> {
                                                            List<Card> sectionCards = result.list().stream()
                                                                    .flatMap(list -> ((List<Card>) list).stream())
                                                                    .filter(card -> section.getCardIds().contains(card.getId()))
                                                                    .collect(Collectors.toList());
                                                            return section.setCards(sectionCards);
                                                        })
                                                        .collect(Collectors.toList());
                                                board.setSections(sectionsWithCards);
                                                return board;
                                            });
                                });
                    }
                });
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
                        getCardsFuture = cardService.getAllCardsByBoard(duplicateBoard, null, user, false);
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

                            duplicateSection.sort(Comparator.comparing(section -> duplicateSectionIds.indexOf(section.getId())));

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
            SectionPayload sectionPayload = new SectionPayload(updateBoard.getId()).setCardIds(currentBoard.getCardIds());

            String sectionId = UUID.randomUUID().toString();
            sectionPayload.setTitle(i18n.translate("magneto.section.default.title"));
            updateBoard.addSection(sectionId);
            updateBoard.setCardIds(new ArrayList<>());
            updateBoardFutures.add(sectionService.create(sectionPayload, sectionId));
            promise.complete(updateBoard.toJson());

            // Check if we are changing the layout from section to free
        } else if (!currentBoard.isLayoutFree() && updateBoard.isLayoutFree()) {
            cardService.getAllCardsByBoard(currentBoard, null, user, false)
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
    public Future<JsonObject> restoreBoards(String userId, List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        Future<JsonObject> preDeleteBoardsFuture = preDeleteBoards(userId, boardIds, true);
        preDeleteBoardsFuture.compose(r -> this.handleInsertSharedArrayFromFolder(boardIds))
                .onSuccess(success -> promise.complete(preDeleteBoardsFuture.result()))
                .onFailure(promise::fail);

        return promise.future();
    }

    private Future<Void> handleInsertSharedArrayFromFolder(List<String> boardIds) {
        Promise<Void> promise = Promise.promise();
        List<Future<Void>> futures = new ArrayList<>();
        boardIds.forEach(id -> {
            futures.add(insertSharedArrayFromFolder(id));
        });
        FutureHelper.all(futures)
                .onSuccess(s -> promise.complete())
                .onFailure(promise::fail);
        return promise.future();
    }

    private Future<Void> insertSharedArrayFromFolder(String boardId) {
        Promise<Void> promise = Promise.promise();
        this.folderService.getFolderByBoardId(boardId)
                .onSuccess(folder -> {
                    if (folder != null && !folder.isEmpty() && folder.containsKey(Field.SHARED) && !folder.getJsonArray(Field.SHARED).isEmpty()) {
                        shareBoard(Collections.singletonList(boardId), ShareHelper.getSharedElem(folder.getJsonArray(Field.SHARED)), new ArrayList<>(), false)
                                .onSuccess(s -> promise.complete())
                                .onFailure(promise::fail);
                    } else {
                        promise.complete();
                    }
                })
                .onFailure(promise::fail);
        return promise.future();
    }

    @Override
    public Future<JsonObject> isBoardExternal(String boardId){
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = this.isBoardExternalQuery(boardId);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::isBoardExternal] Failed to get board", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());

                if (result.isEmpty()) {
                    promise.complete(new JsonObject().put("isExternal", false));
                } else {
                    JsonObject board = result.getJsonObject(0);
                    boolean isExternal = board.getBoolean(Field.ISEXTERNAL, false);
                    promise.complete(new JsonObject().put("isExternal", isExternal));
                }
            }
        }));
        return promise.future();
    }

    private JsonObject isBoardExternalQuery(String boardId) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, boardId))
                .project(new JsonObject()
                        .put(Field._ID, 0)
                        .put(Field.ISEXTERNAL, 1));
        return query.getAggregate();
    }

    @Override
    public Future<JsonObject> preDeleteBoards(String userId, List<String> boardIds, boolean restore) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)));
        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject().put(Field.DELETED, !restore)).put(Mongo.UNSET, new JsonObject().put(Field.SHARED, 1));
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
        if (!boardIds.isEmpty()) {
            this.deleteBoards(userId, boardIds)
                    .compose(success -> {
                        Future<JsonObject> deleteSectionsFuture = this.sectionService.deleteByBoards(boardIds);
                        Future<JsonObject> updateFolderFuture = this.folderService.updateOldFolder(boardIds);
                        return CompositeFuture.all(deleteSectionsFuture, updateFolderFuture);
                    })
                    .onFailure(promise::fail)
                    .onSuccess(success -> promise.complete(new JsonObject().put(Field.STATUS, Field.OK)));
        } else {
            promise.complete(new JsonObject());
        }
        return promise.future();
    }

    private Future<JsonObject> deleteBoards(String userId, List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds)));
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

                List<JsonObject> boardList = result.stream()
                        .filter(JsonObject.class::isInstance)
                        .map(JsonObject.class::cast)
                        .map(this::addNormalizedShares)
                        .collect(Collectors.toList());
                promise.complete(ModelHelper.toList(new JsonArray(boardList), Board.class));
            }
        }));

        return promise.future();
    }

    @Override
    public Future<JsonObject> changeBoardVisibility(String boardId, UserInfos user){
        Promise<JsonObject> promise = Promise.promise();

        final Board[] boardRef = new Board[1];

        serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                            if (boards.isEmpty()) {
                                String message = String.format("[Magneto@%s::exportBoardToArchive] No board found with id %s",
                                        this.getClass().getSimpleName(), boardId);
                                log.error(message, new Throwable(message));
                                return Future.failedFuture(message);
                            }
                            boardRef[0] = boards.get(0);
                            return serviceFactory.boardService().getAllDocumentIds(boardId, user);
                })
                .compose(documentIds -> {
                    String imageUrl = boardRef[0].getImageUrl();
                    String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                    documentIds.add(imageId);
                    String backgroundUrl = boardRef[0].getBackgroundUrl();
                    if (backgroundUrl != null) {
                        String backgroundId = backgroundUrl.substring(backgroundUrl.lastIndexOf('/') + 1);
                        documentIds.add(backgroundId);
                    }
                    JsonObject action = new JsonObject()
                            .put(Field.ACTION, EventBusActions.CHANGEVISIBILITY.action())
                            .put(Field.VISIBILITY, boardRef[0].getIsExternal() ? Field.PROTECTED : Field.PUBLIC) //si le board était public, on le met en privé, sinon il était en privé donc on le met en public
                            .put(Field.DOCUMENTIDS, documentIds);
                    return EventBusHelper.requestJsonObject(EventBusActions.EventBusAddresses.WORKSPACE_BUS_ADDRESS.address(), serviceFactory.eventBus(), action);
                })
                .compose(truc -> {
                    BoardPayload payload = new BoardPayload(boardRef[0].toJson());
                    payload.setIsExternal(!payload.getIsExternal());
                    return serviceFactory.boardService().update(payload);
                })
                .compose(result -> getAndUpdateDescriptionDocuments(boardRef[0].getId(), user, boardRef[0].getIsExternal()))
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::changeBoardVisibility] Failed to change visibility", this.getClass().getSimpleName());
                    promise.fail(message);
                })
                .onSuccess(promise::complete);
        return promise.future();
    }

    @Override
    public Future<JsonObject> getBoardSharedUsers(String boardId){
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = this.getBoardById(boardId);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getBoardSharedUsers] Failed to get all board shared users : %s", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                        
                promise.complete(result.getJsonObject(0));
            }
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> getAllBoards(UserInfos user, Integer page,
                                           String searchText, String folderId,
                                           boolean isPublic,
                                           boolean isShared, boolean isExclusivelyShared, boolean isDeleted, String sortBy,
                                           boolean allFolders) {

        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> fetchAllBoardsFuture = fetchAllBoards(user, page, searchText, folderId, isPublic, isShared,
                isExclusivelyShared, isDeleted, sortBy, false, allFolders);

        Future<JsonArray> fetchAllBoardsCountFuture = fetchAllBoards(user, page, searchText, folderId, isPublic, isShared,
                isExclusivelyShared, isDeleted, sortBy, true, allFolders);

        CompositeFuture.all(fetchAllBoardsFuture, fetchAllBoardsCountFuture)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllBoards] Failed to get boards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(success -> {
                    JsonArray boards = new JsonArray(fetchAllBoardsFuture.result()
                    .stream()
                    .filter(JsonObject.class::isInstance)
                    .map(JsonObject.class::cast)
                    .map(board -> addNormalizedShares(board))
                    .collect(Collectors.toList()));
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
                                             boolean isPublic, boolean isShared, boolean isExclusivelyShared, boolean isDeleted,
                                             String sortBy, boolean getCount, boolean allFolders) {

        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = this.getAllBoardsQuery(user, page, searchText, folderId, isPublic, isShared, isExclusivelyShared,
                isDeleted, sortBy, getCount, allFolders);

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
                                         boolean isPublic, boolean isShared, boolean isExclusivelyShared, boolean isDeleted,
                                         String sortBy, boolean getCount, boolean allFolders) {

        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.DELETED, isDeleted));

        if (isPublic) {
            query.match(new JsonObject()
                    .put(Field.PUBLIC, true));
        } else {
            if (isShared || isExclusivelyShared) {
                JsonArray arr = new JsonArray();
                if (!isExclusivelyShared) {
                    arr.add(new JsonObject().put(Field.OWNERID, user.getUserId()));
                } else {
                    query.match(new JsonObject().put(Field.OWNERID,
                            new JsonObject().put(Mongo.NE, user.getUserId())));
                }
                arr.add(new JsonObject()
                                .put(String.format("%s.%s", Field.SHARED, Field.USERID), new JsonObject().put(Mongo.IN,
                                        new JsonArray().add(user.getUserId()))))
                    .add(new JsonObject()
                                .put(String.format("%s.%s", Field.SHARED, Field.GROUPID), new JsonObject().put(Mongo.IN, user.getGroupsIds())));

                query.matchOr(arr);
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
            query.project(new JsonObject()
                            .put(Field._ID, 1)
                            .put(Field.TITLE, 1)
                            .put(Field.IMAGEURL, 1)
                            .put(Field.BACKGROUNDURL, 1)
                            .put(Field.LAYOUTTYPE, 1)
                            .put(Field.NBCARDS, new JsonObject().put(Mongo.SIZE, String.format("$%s", Field.CARDIDS)))
                            .put(Field.NBCARDSSECTIONS, 1)
                            .put(Field.MODIFICATIONDATE, 1)
                            .put(Field.FOLDERID, getFolderFiltersForGetBoards(user))
                            .put(Field.DESCRIPTION, 1)
                            .put(Field.OWNERID, 1)
                            .put(Field.OWNERNAME, 1)
                            .put(Field.SHARED, 1)
                            .put(Field.TAGS, 1)
                            .put(Field.PUBLIC, 1)
                            .put(Field.DELETED, 1)
                            .put(Field.CANCOMMENT, 1)
                            .put(Field.DISPLAY_NB_FAVORITES, 1)
                            .put(Field.ISLOCKED, 1)
                            .put(Field.ISEXTERNAL, 1)
                    )
                    .unwind(Field.FOLDERID, true);
        }

        // If user searches a term, remove folder filter
        if ((searchText == null || searchText.isEmpty()) && !allFolders) {

            if (folderId != null || isDeleted) {
                query.match(new JsonObject().put(String.format("%s.%s", Field.FOLDERID, Field._ID), folderId));
            } else {
                filterBoardWithoutFolder(user, query);
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
                .put(Field.DISPLAY_NB_FAVORITES, 1)
                .put(Field.ISLOCKED, 1)
                .put(Field.ISEXTERNAL, 1));
        if (getCount) {
            query = query.count();
        } else {
            if (page != null) {
                query.page(page);
            }
        }

        return query.getAggregate();
    }

    private static JsonObject getFolderFiltersForGetBoards(UserInfos user) {
        JsonObject sharedCheck = new JsonObject() //share field exists and is not empty
                .put(Mongo.GT, new JsonArray().add(
                                new JsonObject().put(Mongo.SIZE,
                                        new JsonObject().put(Mongo.FILTER,
                                                new JsonObject().put(Mongo.INPUT, String.format("$$%s.%s", Field.FOLDER, Field.SHARED))
                                                        .put(Mongo.AS, Field.ALLFOLDERS)
                                                        .put(Mongo.COND, new JsonObject().put(Mongo.OR,
                                                                new JsonArray()
                                                                        .add(new JsonObject().put(Mongo.EQ, new JsonArray()
                                                                                        .add(String.format("$$%s.%s", Field.ALLFOLDERS, Field.USERID))
                                                                                        .add(user.getUserId())
                                                                                )
                                                                        ).add(new JsonObject().put(Mongo.IN, new JsonArray()
                                                                                        .add(String.format("$$%s.%s", Field.ALLFOLDERS, Field.GROUPID))
                                                                                        .add(user.getGroupsIds())
                                                                                )
                                                                        )
                                                        )))))
                        .add(0)
                );

        JsonObject checkNull = new JsonObject().put(Mongo.IFNULL, new JsonArray().add(String.format("$$%s.%s", Field.FOLDER, Field.SHARED)).add(false));
        JsonObject checkEmpty = new JsonObject().put(Mongo.NE,
                new JsonArray().add(new JsonObject().put(String.format("$%s", Field.SIZE),
                                new JsonObject().put(Mongo.IFNULL,
                                        new JsonArray().add(String.format("$$%s.%s", Field.FOLDER, Field.SHARED)).add(false))))
                        .add(0));
        JsonObject andCheckShared = new JsonObject().put(Mongo.AND, new JsonArray().add(checkNull).add(checkEmpty).add(sharedCheck));
        return new JsonObject().put(Mongo.FILTER,
                new JsonObject()
                        .put(Mongo.INPUT, String.format("$%s", Field.FOLDERS))
                        .put(Mongo.AS, Field.FOLDER)
                        .put(Mongo.COND,
                                new JsonObject().put(Mongo.AND, new JsonArray()
                                        .add(new JsonObject().put(Mongo.OR, new JsonArray()
                                                .add(new JsonObject().put(Mongo.EQ, new JsonArray() //user is owner
                                                        .add(String.format("$$%s.%s", Field.FOLDER, Field.OWNERID))
                                                        .add(user.getUserId())))
                                                .add(andCheckShared)
                                        ))
                                        .add(new JsonObject().put(Mongo.EQ, new JsonArray()
                                                .add(String.format("$$%s.%s", Field.FOLDER, Field.DELETED))
                                                .add(String.format("$%s", Field.DELETED)))))
                        )
        );
    }

    /**
     * génerate the match to get boards from main page
     *
     * @param user
     * @param query
     */
    private static void filterBoardWithoutFolder(UserInfos user, MongoQuery query) {
        JsonObject folderIdMatch = new JsonObject().putNull(String.format("%s.%s", Field.FOLDERID, Field._ID));
        JsonObject userRequest = new JsonObject()
                .put(String.format("%s.%s", Field.FOLDERID, Field.SHARED), new JsonObject()
                        .put(Mongo.NOT, new JsonObject()
                                .put(Mongo.ELEMMATCH, new JsonObject()
                                        .put(Field.USERID, user.getUserId()))));

        JsonObject checkGroupRequest = new JsonObject()
                .put(String.format("%s.%s.%s", Field.FOLDERID, Field.SHARED, Field.GROUPID), new JsonObject().put(Mongo.NIN, user.getGroupsIds()));

        JsonObject notUserFolder = new JsonObject()
                .put(String.format("%s.%s", Field.FOLDERID, Field.OWNERID),
                        new JsonObject().put(Mongo.NE, user.getUserId()));
        JsonObject folderNotShared = new JsonObject().put(String.format("%s.%s", Field.FOLDERID, Field.SHARED),
                new JsonObject().put(Mongo.EXISTS, true).put(Mongo.NE, new JsonArray()));

        JsonObject folderNotOwned = new JsonObject().put(Field.OWNERID, String.format("$%s.$%s", Field.FOLDERID, Field.OWNERID));

        JsonObject filterPreviousBoardsInForeignFolders = new JsonObject().put(Mongo.AND, new JsonArray().add(folderNotShared).add(folderNotOwned));
        JsonObject andCondition = new JsonObject().put(Mongo.AND,
                new JsonArray().add(userRequest).add(checkGroupRequest).add(notUserFolder).add(filterPreviousBoardsInForeignFolders));

        query.matchOr(new JsonArray().add(folderIdMatch).add(andCondition));
    }

    private JsonObject getAllBoardsEditableQuery(UserInfos user) {

        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field.DELETED, false));
        JsonObject userOrCondition = new JsonObject()
                .put(Field.SHARED,
                        new JsonObject()
                                .put(Mongo.ELEMMATCH, new JsonObject()
                                        .put(Field.USERID, user.getUserId())
                                        .put(Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT, true)));

        JsonObject groupOrCondition = new JsonObject()
                .put(Field.SHARED,
                        new JsonObject()
                                .put(Mongo.ELEMMATCH, new JsonObject()
                                        .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                                        .put(Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT, true)));

        query.matchOr(new JsonArray()
                .add(new JsonObject().put(Field.OWNERID, user.getUserId()))
                .add(userOrCondition)
                .add(groupOrCondition)
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
                .lookUp(CollectionsConstant.SECTION_COLLECTION, Field.SECTIONIDS, Field._ID, Field.SECTIONS)
                .addFields(Field.NBCARDSSECTIONS, new JsonObject().put(Mongo.SUM, new JsonObject().put(
                                        Mongo.MAP, new JsonObject()
                                                .put(Mongo.INPUT, String.format("$%s", Field.SECTIONS))
                                                .put(Mongo.AS, Field.SECTION)
                                                .put(Mongo.IN_MAP, new JsonObject().put(Mongo.SIZE, String.format("$$%s.%s", Field.SECTION, Field.CARDIDS)))
                                )
                        )
                )
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.IMAGEURL, 1)
                        .put(Field.BACKGROUNDURL, 1)
                        .put(Field.CREATIONDATE, 1)
                        .put(Field.SECTIONIDS, 1)
                        .put(Field.NBCARDS, new JsonObject().put(Mongo.SIZE, String.format("$%s", Field.CARDIDS)))
                        .put(Field.NBCARDSSECTIONS, 1)
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
                        .put(Field.DISPLAY_NB_FAVORITES, 1)
                        .put(Field.ISLOCKED, new JsonObject().put("$ifNull", new JsonArray().add("$" + Field.ISLOCKED).add(false)))
                        .put(Field.ISEXTERNAL, new JsonObject().put("$ifNull", new JsonArray().add("$" + Field.ISEXTERNAL).add(false))));
        return query.getAggregate();
    }

    private JsonObject getBoardById(String boardId) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray().add(boardId))))
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.OWNERID, 1)
                        .put(Field.SHARED, 1));
        return query.getAggregate();
    }

    @Override
    public Future<List<Board>> getAllBoardsByCreationDate(StatisticsPayload statisticsPayload) {
        Promise<List<Board>> promise = Promise.promise();
        Pattern datePattern = Pattern.compile("^" + statisticsPayload.getDate());
        Bson matcher = Filters.regex(Field.CREATIONDATE, datePattern);
        mongoDb.find(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::get] Failed to get boards by creation date", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(ModelHelper.toList(results.right().getValue(), Board.class));
        }));
        return promise.future();
    }

    @Override
    public Future<List<String>> getAllDocumentIds(String boardId, UserInfos user) {
        Promise<List<String>> promise = Promise.promise();

        this.cardService.getAllCardsByBoard(new Board(new JsonObject().put(Field._ID, boardId)), user, user)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAllDocumentIds] Failed to get documents ids", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .onSuccess(cards -> {
                    List<String> cardIds = cards.stream().map(Card::getResourceId)
                            .collect(Collectors.toList());
                    promise.complete(cardIds);
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> getAndUpdateDescriptionDocuments(String boardId, UserInfos user, Boolean isExternal) {
        Promise<JsonObject> promise = Promise.promise();
        final VisibilityFilter oldVisibilityFilter = isExternal ? VisibilityFilter.PUBLIC : VisibilityFilter.OWNER;
        final VisibilityFilter newVisibilityFilter = isExternal ? VisibilityFilter.OWNER : VisibilityFilter.PUBLIC;


        List<String> documentIds = new ArrayList<>();
        List<Card> cardsList = new ArrayList<>();
        Map<String, List<String>> idsByCard = new HashMap<>();

        this.cardService.getAllCardsByBoard(new Board(new JsonObject().put(Field._ID, boardId)), user, user)
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAndUpdateDescriptionDocuments] Failed to get all board cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                })
                .compose(cards -> {
                    for(Card card : cards){
                        final List<String> currentIds = ResourceUtils.extractIds(card.getDescription(), oldVisibilityFilter);
                        if(!currentIds.isEmpty()){
                            cardsList.add(card);
                            idsByCard.put(card.getId(), currentIds);
                        }
                        documentIds.addAll(currentIds);
                    };
                    JsonObject action = new JsonObject()
                            .put(Field.ACTION, EventBusActions.CHANGEVISIBILITY.action())
                            .put(Field.VISIBILITY, isExternal ? Field.PROTECTED : Field.PUBLIC)
                            .put(Field.DOCUMENTIDS, documentIds);
                    return EventBusHelper.requestJsonObject(EventBusActions.EventBusAddresses.WORKSPACE_BUS_ADDRESS.address(), serviceFactory.eventBus(), action);
                })
                .compose(result -> {
                    List<Future> updateCardsFutures = new ArrayList<>();

                    for(Card card : cardsList){
                        Future<Card> cardUpdateFuture = Future.future(prom -> {
                            String content = card.getDescription();
                            List<String> ids = idsByCard.get(card.getId());

                            CardPayload updateCard = new CardPayload(card.toJson())
                                    .setId(card.getId())
                                    .setDescription(ResourceUtils.transformUrlTo(content, ids, newVisibilityFilter));

                            cardService.update(updateCard)
                                    .onSuccess(promise::complete)
                                    .onFailure(fail -> {
                                        log.error("[Magneto@%s::getAndUpdateDescriptionDocuments] Failed to update card", this.getClass().getSimpleName(),
                                                fail.getMessage());
                                        promise.fail(fail.getMessage());
                                    });
                        });

                        updateCardsFutures.add(cardUpdateFuture);
                    }

                    // Utilisez Future.all pour attendre toutes les mises à jour
                    return CompositeFuture.all(updateCardsFutures);
                })
                .onSuccess(v -> {
                    promise.complete(new JsonObject()
                            .put("status", "success")
                            .put("message", "Documents updated successfully")
                            .put("boardId", boardId)
                            .put("documentCount", documentIds.size())
                    );
                })
                .onFailure(fail -> {
                    log.error("[Magneto@%s::getAndUpdateDescriptionDocuments] Failed to update all the board cards", this.getClass().getSimpleName(),
                            fail.getMessage());
                    promise.fail(fail.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<List<String>> shareBoard(List<String> ids, JsonObject share, boolean checkOldRights) {
        Promise<List<String>> promise = Promise.promise();
        List<Future<JsonObject>> futures = new ArrayList<>();
        ids.forEach(id -> futures.add(this.shareService.upsertSharedArray(id, share, this.collection, checkOldRights)));
        FutureHelper.all(futures)
                .onSuccess(success -> promise.complete(ids))
                .onFailure(error -> promise.fail(error.getMessage()));
        return promise.future();
    }

    @Override
    public Future<List<String>> shareBoard(List<String> ids, List<SharedElem> share, List<SharedElem> deletedShared, boolean b) {
        Promise<List<String>> promise = Promise.promise();
        List<Future<JsonObject>> futures = new ArrayList<>();
        ids.forEach(id -> futures.add(this.shareService.upsertSharedArray(id, share, deletedShared, this.collection, true)));
        FutureHelper.all(futures)
                .onSuccess(success -> promise.complete(ids))
                .onFailure(error -> promise.fail(error.getMessage()));
        return promise.future();
    }

    @Override
    public Future<List<String>> getOwnedBoardsIds(List<String> boardsIds, String ownerId) {
        Promise<List<String>> promise = Promise.promise();
        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, boardsIds)).put(Field.OWNERID, ownerId)).getAggregate();
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getBoards] Failed to get boards", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result.stream().filter(JsonObject.class::isInstance)
                        .map(JsonObject.class::cast)
                        .map(board -> board.getString(Field._ID))
                        .collect(Collectors.toList()));
            }
        }));

        return promise.future();
    }

    private JsonObject getBoardWithCardsByIds(List<String> boardIds) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds))))
                .lookUp(CollectionsConstant.SECTION_COLLECTION, Field.SECTIONIDS, Field._ID, Field.SECTIONS)
                .addFields(Field.NBCARDSSECTIONS, new JsonObject().put(Mongo.SUM, new JsonObject().put(
                                        Mongo.MAP, new JsonObject()
                                                .put(Mongo.INPUT, String.format("$%s", Field.SECTIONS))
                                                .put(Mongo.AS, Field.SECTION)
                                                .put(Mongo.IN_MAP, new JsonObject().put(Mongo.SIZE, String.format("$$%s.%s", Field.SECTION, Field.CARDIDS)))
                                )
                        )
                )
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
                        .put(Field.NBCARDSSECTIONS, 1)
                        .put(Field.DESCRIPTION, 1)
                        .put(Field.OWNERID, 1)
                        .put(Field.OWNERNAME, 1)
                        .put(Field.SHARED, 1)
                        .put(Field.TAGS, 1)
                        .put(Field.PUBLIC, 1)
                        .put(Field.CANCOMMENT, 1)
                        .put(Field.DISPLAY_NB_FAVORITES, 1)
                        .put(Field.ISLOCKED, 1)
                        .put(Field.ISEXTERNAL, 1));
        return query.getAggregate();
    }

    @Override
    public Future<List<Board>> getBoardsWithNbCards(List<String> resultIds) {
        Promise<List<Board>> promise = Promise.promise();
        JsonObject query = this.getBoardWithCardsByIds(resultIds);
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
    public Future<JsonArray> getAllBoardImages(List<String> boardIds) {
        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(boardIds))))
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.IMAGEURL, 1))
                .getAggregate();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getAllBoardImages] Failed to get board images",
                        this.getClass().getSimpleName(), either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());

                JsonArray boardImages = new JsonArray();
                result.stream()
                        .filter(JsonObject.class::isInstance)
                        .map(JsonObject.class::cast)
                        .forEach(board -> {
                            boardImages.add(new JsonObject()
                                    .put(Field._ID, board.getString(Field._ID))
                                    .put(Field.IMAGEURL, board.getString(Field.IMAGEURL)));
                        });
                promise.complete(boardImages);
            }
        }));

        return promise.future();
    }
}
