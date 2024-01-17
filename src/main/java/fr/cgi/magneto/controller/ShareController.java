package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.share.SharedElem;
import fr.cgi.magneto.security.GetSharesRight;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.request.*;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.*;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.List;

public class ShareController extends ControllerHelper {

    private final BoardService boardService;
    private final WorkspaceService workspaceService;
    private final FolderService folderService;

    private final ShareService magnetoShareService;

    public ShareController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.folderService = serviceFactory.folderService();
        this.workspaceService = serviceFactory.workSpaceService();
        this.magnetoShareService = serviceFactory.shareService();

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

    @Get("/:type/share/json/:id")
    @ApiDoc("Share board by id")
    @ResourceFilter(GetSharesRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareBoard(final HttpServerRequest request) {
        shareJson(request, false);
    }

    @Put("/:type/share/resource/:id")
    @ApiDoc("Share board by id")
    @ResourceFilter(GetSharesRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void shareResource(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
            if (user != null) {
                final String id = request.params().get(Field.ID);
                final String type = request.params().get(Field.TYPE);
                if (id == null || id.trim().isEmpty()) {
                    badRequest(request, "invalid.id");
                    return;
                }
                RequestUtils.bodyToJson(request, share -> {
                    List<SharedElem> newSharedElem = this.magnetoShareService.getSharedElemList(share);
                    if (type.equals(Field.BOARD)) {

                        handleShareBoard(request, user, share, id, newSharedElem, i18nHelper);

                    } else if (type.equals(Field.FOLDER)) {
                        handleShareFolder(request, user, newSharedElem, id, i18nHelper, share);
                    }
                });
            }
        });
    }

    private void handleShareBoard(HttpServerRequest request, UserInfos user, JsonObject share, String id, List<SharedElem> newSharedElem, I18nHelper i18nHelper) {
        this.folderService.getFolderByBoardId(id).onSuccess(s -> {
            if (this.magnetoShareService.checkRights(newSharedElem, s)) {
                this.boardService.getAllDocumentIds(id, user)
                        .compose(documentIds -> this.workspaceService.setShareRights(documentIds, share)
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

                                    List<String> ids = new ArrayList<>();
                                    ids.add(id);
                                    this.boardService.shareBoard(ids, share, false).onSuccess(success -> {
                                        notification.notifyTimeline(request, "magneto.share_folder", user, new ArrayList<>(), id, "test",
                                                params, true);
                                        request.response().setStatusMessage(id).setStatusCode(200).end();
                                    });
                                }));
            } else {
                badRequest(request, "Can't apply this rights");
            }
        });
    }

    private void handleShareFolder(HttpServerRequest request, UserInfos user, List<SharedElem> newSharedElem, String id, I18nHelper i18nHelper, JsonObject share) {

        Future<List<SharedElem>> deletedRightFuture = this.magnetoShareService.getDeletedRights(id, newSharedElem, CollectionsConstant.FOLDER_COLLECTION);
        this.magnetoShareService.checkParentRights(id, newSharedElem, CollectionsConstant.FOLDER_COLLECTION)
                .onSuccess(checkRight -> {
                            if (checkRight) {
                                deletedRightFuture
                                        .compose(deleteRights -> this.folderService.shareFolder(id, newSharedElem, deleteRights))
                                        .compose(success -> this.folderService.getChildrenBoardsIds(id))
                                        .compose(boardsIds -> this.boardService.shareBoard(boardsIds, newSharedElem, deletedRightFuture.result(), true))
                                        .compose(boardsIds -> this.workspaceService.setShareRights(boardsIds, share))
                                        .onSuccess(success -> {
                                            JsonObject params = new JsonObject();
                                            params.put(Field.PROFILURI, "/userbook/annuaire#" + user.getUserId() + "#" + user.getType());
                                            params.put(Field.USERNAME, user.getUsername());
                                            params.put(Field.BOARDURL, "/magneto#/");

                                            JsonObject pushNotif = new JsonObject()
                                                    .put(Field.TITLE, "push.notif.magneto.share")
                                                    .put(Field.BODY, user.getUsername() + " " + i18nHelper.translate("magneto.shared.push.notif.body"));
                                            params.put(Field.PUSHNOTIF, pushNotif);

                                            notification.notifyTimeline(request, "magneto.share_folder", user, new ArrayList<>(), id, "test",
                                                    params, true);
                                            request.response().setStatusMessage(id).setStatusCode(200).end();
                                        })
                                        .onFailure(error -> badRequest(request, error.getMessage()));
                            } else {
                                badRequest(request, "Can't apply this rights");
                            }
                        }
                );
    }


}
