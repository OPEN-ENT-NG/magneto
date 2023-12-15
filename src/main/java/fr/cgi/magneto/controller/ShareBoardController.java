package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.security.GetSharesRight;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.*;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.*;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

public class ShareBoardController extends ControllerHelper {

    private final BoardService boardService;
    private final WorkspaceService workspaceService;
    public ShareBoardController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.workspaceService = serviceFactory.workSpaceService();
    }

    // Init sharing rights
    @SecuredAction(value = Rights.READ, type = ActionType.RESOURCE)
    public void initReadRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Rights.CONTRIB, type = ActionType.RESOURCE)
    public void initContribRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Rights.MANAGER, type = ActionType.RESOURCE)
    public void initManagerRight(final HttpServerRequest request) {
    }

    @SecuredAction(value = Rights.PUBLISH, type = ActionType.RESOURCE)
    public void initPublishRight(final HttpServerRequest request) {
    }

    @Get("/share/json/:id")
    @ApiDoc("Share board by id")
    @ResourceFilter(GetSharesRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareBoard(final HttpServerRequest request) {
        shareJson(request, false);
    }

    @Put("/share/resource/:id")
    @ApiDoc("Share board by id")
    @ResourceFilter(GetSharesRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareResource(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
            if (user != null) {
                final String id = request.params().get(Field.ID);
                if (id == null || id.trim().isEmpty()) {
                    badRequest(request, "invalid.id");
                    return;
                }

                RequestUtils.bodyToJson(request, share -> {
                    JsonArray shareArray = WorkspaceHelper.toMongoWorkspaceShareFormat(share);

                    this.boardService.getAllDocumentIds(id, user)
                            .compose(documentIds -> this.workspaceService.setShareRights(documentIds, shareArray)
                            .onFailure(fail -> {
                                log.error(String.format("[Magneto@%s::shareResource] Failed to share board documents %s",
                                        user.getUserId(), id), fail);
                                badRequest(request, fail.getMessage());
                            })
                            .onSuccess(res -> {
                                JsonObject params = new JsonObject();
                                params.put(Field.PROFILURI, "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
                                params.put(Field.USERNAME, user.getUsername());
                                params.put(Field.BOARDURL, "/magneto#/board/view/" + id);

                                JsonObject pushNotif = new JsonObject()
                                        .put(Field.TITLE, "push.notif.magneto.share")
                                        .put(Field.BODY, user.getUsername() + " " + i18nHelper.translate("magneto.shared.push.notif.body"));
                                params.put(Field.PUSHNOTIF, pushNotif);

                                shareResource(request, "magneto.share_board", false, params, Field.TITLE);
                            }));
                });
            }
        });
    }


}
