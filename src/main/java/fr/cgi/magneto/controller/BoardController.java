package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Actions;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.security.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.Trace;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.enums.Events.CREATE_BOARD;

public class BoardController extends ControllerHelper {

    private final EventStore eventStore;
    private final BoardService boardService;
    private final CardService cardService;
    private final SectionService sectionService;

    private final FolderService folderService;


    public BoardController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.cardService = serviceFactory.cardService();
        this.sectionService = serviceFactory.sectionService();
        this.folderService = serviceFactory.folderService();
        this.eventStore = EventStoreFactory.getFactory().getEventStore(Magneto.class.getSimpleName());
    }

    @Get("/boards")
    @ApiDoc("Get all boards")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllBoards(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String searchText = (request.getParam(Field.SEARCHTEXT) != null) ?
                    request.getParam(Field.SEARCHTEXT) : "";
            String folderId = request.getParam(Field.FOLDERID);
            boolean isPublic = Boolean.parseBoolean(request.getParam(Field.ISPUBLIC));
            boolean isShared = Boolean.parseBoolean(request.getParam(Field.ISSHARED));
            boolean isDeleted = Boolean.parseBoolean(request.getParam(Field.ISDELETED));
            String sortBy = request.getParam(Field.SORTBY);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            boardService.getAllBoards(user, page, searchText, folderId, isPublic, isShared, isDeleted, sortBy)
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllBoards] Failed to get all boards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Get("/boards/editable")
    @ApiDoc("Get all boards editable")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllBoardsEditable(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            boardService.getAllBoardsEditable(user)
                    .onSuccess(result -> {
                        JsonArray boardsResult = new JsonArray(result
                                .stream()
                                .map(Board::toJson)
                                .collect(Collectors.toList()));
                        renderJson(request, new JsonObject()
                                .put(Field.ALL, boardsResult));
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllBoardsEditable] Failed to get all boards editable : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }


    @Post("/boards")
    @ApiDoc("Get boards by ids")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void getBoardsByIds(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "boardList", boards -> {
            List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
            boardService.getBoards(boardIds)
                    .onSuccess(result -> {
                        JsonArray boardsResult = new JsonArray(result
                                .stream()
                                .map(Board::toJson)
                                .collect(Collectors.toList()));
                        renderJson(request, new JsonObject()
                                .put(Field.ALL, boardsResult));
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllBoardsByIds] Failed to get all boards by ids : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Post("/board")
    @ApiDoc("Create a board")
    @SecuredAction(Rights.MANAGE_BOARD)
    @Trace(Actions.BOARD_CREATION)
    public void create(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "board", board ->
                UserUtils.getUserInfos(eb, request, user ->
                        boardService.create(user, board, true, request)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> {
                                    eventStore.createAndStoreEvent(CREATE_BOARD.name(), request);
                                    renderJson(request, result);
                                })));
    }

    @Put("/board/duplicate/:boardId")
    @ApiDoc("Duplicate a board")
    @ResourceFilter(DuplicateBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.BOARD_DUPLICATE)
    @SuppressWarnings("unchecked")
    public void duplicate(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String boardId = request.getParam(Field.BOARDID);
            Map<String, Future<?>> futures = new HashMap<>();
            JsonObject futuresInfos = new JsonObject();

            boardService.getBoards(Collections.singletonList(boardId))
                    .compose(boardResult -> {
                        if (!boardResult.isEmpty()) {
                            Board duplicateBoard = boardResult.get(0);
                            futuresInfos.put(Field.BOARD, duplicateBoard.toJson());
                            Future<JsonObject> getCardsFuture = Future.succeededFuture();
                            Future<List<Section>> getSectionsFuture = Future.succeededFuture();

                            if (!duplicateBoard.isLayoutFree()) {
                                getSectionsFuture = sectionService.getSectionsByBoardId(duplicateBoard.getId());
                                futures.put(Field.SECTION, getSectionsFuture);
                            }
                            getCardsFuture = cardService.getAllCardsByBoard(duplicateBoard, null);
                            futures.put(Field.CARDS, getCardsFuture);

                            // Reset new board
                            duplicateBoard.setId(null);
                            duplicateBoard.setPublic(false);
                            duplicateBoard.setShared(new JsonArray());
                            Future<JsonObject> createBoardFuture = boardService.create(user, duplicateBoard.toJson(), false, request);
                            futures.put(Field.BOARD, createBoardFuture);
                            return CompositeFuture.all(getCardsFuture, getSectionsFuture, createBoardFuture);
                        } else {
                            return Future.failedFuture(String.format("[Magneto%s::duplicate] " +
                                    "No board found with id %s", this.getClass().getSimpleName(), boardId));
                        }
                    })
                    .compose(result -> {
                        if (result.succeeded()) {
                            String duplicateBoard = ((JsonObject) futures.get(Field.BOARD).result()).getString(Field.ID);
                            JsonArray duplicateCardsArray = ((JsonObject) futures.get(Field.CARDS).result()).getJsonArray(Field.ALL);
                            List<Card> duplicateCards = duplicateCardsArray.getList();
                            List<Future> duplicateFuture = new ArrayList<>();

                            if (!futuresInfos.getJsonObject(Field.BOARD).getString(Field.LAYOUTTYPE).equals(Field.FREE)) {
                                List<Section> duplicateSection = (List<Section>) futures.get(Field.SECTION).result();
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
                                    duplicateFuture.add(cardService.duplicateCards(duplicateBoard, duplicateCards, null, user));
                                }
                            }
                            return CompositeFuture.all(duplicateFuture);
                        } else {
                            return Future.failedFuture(String.format("[Magneto%s::duplicate] " +
                                    "No board found with id %s", this.getClass().getSimpleName(), boardId));
                        }
                    })
                    .onFailure(err -> renderError(request))
                    .onSuccess(result -> renderJson(request, new JsonObject()));
        });
    }

    @Put("/board/:id")
    @ApiDoc("Update a board")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.BOARD_UPDATE)
    @SuppressWarnings("unchecked")
    public void update(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "boardUpdate", board -> {
            String boardId = request.getParam(Field.ID);
            UserUtils.getUserInfos(eb, request, user -> {
                boardService.getBoards(Collections.singletonList(boardId))
                        .compose(boards -> {
                            if (!boards.isEmpty()) {
                                BoardPayload updateBoard = new BoardPayload(board)
                                        .setId(boardId)
                                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                                Board currentBoard = boards.get(0);
                                return this.addCardsToUpdate(updateBoard, currentBoard, request)
                                        .compose(boardUpdated -> boardService.update(new BoardPayload(boardUpdated)));
                            } else {
                                return Future.failedFuture(String.format("[Magneto%s::update] " +
                                        "No board found with id %s", this.getClass().getSimpleName(), boardId));
                            }
                        })
                        .onFailure(err -> renderError(request))
                        .onSuccess(result -> renderJson(request, new JsonObject()));
            });
        });
    }

    private Future<JsonObject> addCardsToUpdate(BoardPayload updateBoard, Board currentBoard, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();
        List<Future> updateBoardFutures = new ArrayList<>();

        if (currentBoard.isLayoutFree() && !updateBoard.isLayoutFree()) {
            SectionPayload sectionPayload = new SectionPayload(updateBoard.getId()).setCardIds(currentBoard.cardIds());
            if (currentBoard.sectionIds().isEmpty()) {
                String sectionId = UUID.randomUUID().toString();
                sectionPayload.setTitle(I18n.getInstance().translate("magneto.section.default.title", getHost(request), I18n.acceptLanguage(request)));
                updateBoard.addSection(sectionId);
                updateBoardFutures.add(sectionService.create(sectionPayload, sectionId));
            } else {
                updateBoardFutures.add(sectionService.update(sectionPayload.setId(currentBoard.sectionIds().get(0))));
            }
            promise.complete(updateBoard.toJson());
        } else if (!currentBoard.isLayoutFree() && updateBoard.isLayoutFree()) {
            cardService.getAllCardsByBoard(currentBoard, null)
                    .compose(cards -> {
                        List<Card> cardsList = cards.getJsonArray(Field.ALL).getList();
                        List<String> cardIds = cardsList.stream().map(Card::getId).collect(Collectors.toList());
                        updateBoard.setCardIds(cardIds);
                        promise.complete(updateBoard.toJson());
                        return Future.succeededFuture();
                    });
        }
        return promise.future();
    }


    @Put("/boards/predelete")
    @ApiDoc("Pre delete boards")
    @ResourceFilter(DeleteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void preDeleteBoards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "boardList", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                            boardService.preDeleteBoards(user.getUserId(), boardIds, false)
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(result -> renderJson(request, result));
                        }
                ));
    }

    @Put("/boards/restore")
    @ApiDoc("Restore pre deleted boards")
    @ResourceFilter(DeleteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void restorePreDeletedBoards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "boardList", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                            boardService.preDeleteBoards(user.getUserId(), boardIds, true)
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(result -> renderJson(request, result));
                        }
                ));
    }

    @Delete("/boards")
    @ApiDoc("Delete boards")
    @ResourceFilter(DeleteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.BOARD_DELETION)
    @SuppressWarnings("unchecked")
    public void deleteBoards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "boardList", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                    Future<JsonObject> removeCardsFuture = cardService.deleteCardsByBoards(boardIds);
                    Future<JsonObject> removeBoardsFuture = boardService.delete(user.getUserId(), boardIds);
                    CompositeFuture.all(removeCardsFuture, removeBoardsFuture)
                            .onFailure(err -> renderError(request))
                            .onSuccess(result -> renderJson(request, new JsonObject()
                                    .put(Field.NBBOARDS, removeBoardsFuture.result())
                                    .put(Field.NBCARDS, removeCardsFuture.result())));
                })
        );
    }

    @Put("/boards/folder/:folderId")
    @ApiDoc("Move boards to a folder")
    @ResourceFilter(MoveBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void moveBoardsToFolder(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "moveBoards", boards ->
                UserUtils.getUserInfos(eb, request, user -> {
                    String folderId = request.getParam(Field.FOLDERID);
                    List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                    folderService.moveBoardsToFolder(user.getUserId(), boardIds, folderId)
                            .onFailure(err -> renderError(request))
                            .onSuccess(result -> renderJson(request, result));
                }));
    }


}
