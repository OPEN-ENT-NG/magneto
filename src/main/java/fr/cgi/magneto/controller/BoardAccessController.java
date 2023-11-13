package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.service.BoardAccessService;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

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
            boardAccessService.getLastAccess(user.getUserId())
                    .compose(result -> boardService.getBoards(result))
                    .onSuccess(result -> renderJson(request, new JsonObject().put(Field.ALL, result)))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getLastBoardsAccessed] Failed to get all boards by ids : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }
}
