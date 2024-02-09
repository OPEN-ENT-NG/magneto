package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.service.BoardAccessService;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class BoardAccessController extends ControllerHelper {
    BoardAccessService boardAccessService;
    BoardService boardService;

    public BoardAccessController(ServiceFactory serviceFactory) {
        this.boardAccessService = serviceFactory.boardViewService();
        this.boardService = serviceFactory.boardService();
    }

    @Get("/board/view/last")
    @ApiDoc("Get the last boards seen by user")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getLastBoardsAccessed(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            Future<List<String>> getLastAccessFuture = boardAccessService.getLastAccess(user.getUserId());
            getLastAccessFuture.compose(resultIds -> boardService.getBoardsWithNbCards(resultIds))
                    .onSuccess(boards -> {
                        List<Board> results = new ArrayList<>();
                        getLastAccessFuture.result().forEach(id -> boards.forEach(board -> {
                                    if (board.getId().equals(id)) {
                                        board.setNbCards(board.cards().size());
                                        results.add(board);
                                    }
                                })
                        );
                        renderJson(request, new JsonObject().put(Field.ALL, results));
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getLastBoardsAccessed] Failed to get all boards by ids : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }
}
