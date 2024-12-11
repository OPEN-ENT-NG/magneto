package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Actions;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.security.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.Trace;
import org.entcore.common.user.*;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.enums.Events.CREATE;

public class BoardController extends ControllerHelper {

    private final EventStore eventStore;
    private final BoardService boardService;
    private final BoardAccessService boardAccessService;

    private final SectionService sectionService;
    private final CardService cardService;
    private final FolderService folderService;


    public BoardController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.boardAccessService = serviceFactory.boardViewService();
        this.sectionService = serviceFactory.sectionService();
        this.cardService = serviceFactory.cardService();
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
            boolean allFolders = Boolean.parseBoolean(request.getParam(Field.ALLFOLDERS));
            String sortBy = request.getParam(Field.SORTBY);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            boardService.getAllBoards(user, page, searchText, folderId, isPublic, isShared, isDeleted, sortBy, allFolders)
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
            UserUtils.getUserInfos(eb, request, user -> {
                List<String> boardIds = boards.getJsonArray(Field.BOARDIDS).getList();
                boardAccessService.insertAccess(boardIds, user.getUserId());
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
                            String message = String.format("[Magneto@%s::getBoardsByIds] Failed to get all boards by ids : %s",
                                    this.getClass().getSimpleName(), fail.getMessage());
                            log.error(message);
                            renderError(request);
                        });
            });
        });

    }

    @Post("/board")
    @ApiDoc("Create a board")
    @ResourceFilter(CreateBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.BOARD_CREATION)
    public void create(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "board", board ->
                UserUtils.getUserInfos(eb, request, user -> {
                            I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
                            boolean hasCommRight = WorkflowHelper.hasRight(user, Rights.COMMENT_BOARD);
                            if (!hasCommRight) {
                                board.remove(Field.CANCOMMENT);
                            }
                            boolean hasDisplayNbFavoritesRight = WorkflowHelper.hasRight(user, Rights.DISPLAY_NB_FAVORITES);
                            if (!hasDisplayNbFavoritesRight) {
                                board.remove(Field.DISPLAY_NB_FAVORITES);
                            }
                            boardService.create(user, board, true, i18nHelper)
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(result -> {
                                        eventStore.createAndStoreEvent(CREATE.name(), user, new JsonObject()
                                                .put(Field.RESOURCE_DASH_TYPE, Field.RESOURCE_BOARD));
                                        renderJson(request, result);
                                    });
                        }
                ));
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
            I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
            boardService.duplicate(boardId, user, i18nHelper)
                    .onFailure(err -> renderError(request))
                    .onSuccess(result -> renderJson(request, result));
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
                                boolean hasCommRight = WorkflowHelper.hasRight(user, Rights.COMMENT_BOARD);
                                if (!hasCommRight) {
                                    board.remove(Field.CANCOMMENT);
                                }
                                boolean hasDisplayNbFavoritesRight = WorkflowHelper.hasRight(user, Rights.DISPLAY_NB_FAVORITES);
                                if(!hasDisplayNbFavoritesRight) {
                                    board.remove(Field.DISPLAY_NB_FAVORITES);
                                }
                                BoardPayload updateBoard = new BoardPayload(board)
                                        .setId(boardId)
                                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                                Board currentBoard = boards.get(0);
                                I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
                                return boardService.updateLayoutCards(updateBoard, currentBoard, i18nHelper, user)
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
                            boardService.restoreBoards(user.getUserId(), boardIds)
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
                    Future<JsonObject> removeSectionFuture = sectionService.deleteByBoards(boardIds);
                    Future<JsonObject> removeCardsFuture = cardService.deleteCardsByBoards(boardIds);
                    Future<JsonObject> removeBoardsFuture = boardService.delete(user.getUserId(), boardIds);
                    CompositeFuture.all(removeCardsFuture, removeBoardsFuture, removeSectionFuture)
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


    @Get("/boards/:boardId/resources")
    @ApiDoc("Get board resource ids")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getBoardResourceIds(HttpServerRequest request) {
        String boardId = request.getParam(Field.BOARDID);

        UserUtils.getUserInfos(eb, request, user -> {

            boardService.getAllDocumentIds(boardId, user)
                    .onFailure(err -> renderError(request))
                    .onSuccess(result -> renderJson(request, new JsonObject().put("documents",
                            result)));
        });
    }

    @Post("/board/:boardId/notify")
    @ApiDoc("Notify board shared users")
    @ResourceFilter(ManageBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void notifyBoardUsers(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String boardId = request.getParam(Field.BOARDID);
            boardService.getBoardSharedUsers(boardId)
                    .onSuccess(board -> {
                        JsonObject params = new JsonObject();
                        params.put(Field.BOARDURL, "/magneto#/board/" + boardId + "/view/")
                        .put(Field.BOARDNAME, board.getString(Field.TITLE));

                        List<String> userIdsList = board.getJsonArray(Field.SHARED).stream()
                        .filter(JsonObject.class::isInstance)
                        .map(obj -> ((JsonObject) obj).getString(Field.USERID))
                        .distinct()
                        .collect(Collectors.toList());

                        notification.notifyTimeline(request, "magneto.notify_board", user, userIdsList, params);
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::notifyBoardUsers] Failed to notify users of board : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }
}
