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
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.*;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Handle folders too but can't rename without losing old shared Boards
 */
public class ShareBoardController extends ControllerHelper {

    private final BoardService boardService;
    private final WorkspaceService workspaceService;
    private final FolderService folderService;

    private final ShareService magnetoShareService;

    private final ServiceFactory serviceFactory;
    private final ShareBookMarkService shareBookMarkService;

    public ShareBoardController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.folderService = serviceFactory.folderService();
        this.workspaceService = serviceFactory.workSpaceService();
        this.magnetoShareService = serviceFactory.shareService();
        this.shareBookMarkService = serviceFactory.shareBookMarkService();
        this.serviceFactory = serviceFactory;

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
    public void getShareResource(final HttpServerRequest request) {
        String type = request.params().get(Field.TYPE);
        switch (type) {
            case Field.BOARD:
                this.setShareService(this.serviceFactory.mongoDbShareService(CollectionsConstant.BOARD_COLLECTION));
                break;
            case Field.FOLDER:
                this.setShareService(this.serviceFactory.mongoDbShareService(CollectionsConstant.FOLDER_COLLECTION));
                break;
            default:
                badRequest(request, "Wrong Field called");
                return;
        }
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
                        handleShareBoard(request, user, id, newSharedElem, i18nHelper);

                    } else if (type.equals(Field.FOLDER)) {
                        handleShareFolder(request, user, newSharedElem, id, i18nHelper, share);
                    }
                });
            }
        });
    }

    private void handleShareBoard(HttpServerRequest request, UserInfos user, String id, List<SharedElem> newSharedElem, I18nHelper i18nHelper) {
        this.getBookmarksToElems(user, newSharedElem).compose(bookmarkShared -> {
            newSharedElem.addAll(bookmarkShared);
            JsonObject share = this.magnetoShareService.getSharedJsonFromList(newSharedElem);
            return this.folderService.getFolderByBoardId(id).onSuccess(s -> {
                if (this.magnetoShareService.checkRights(newSharedElem, s)) {
                    this.boardService.getAllDocumentIds(id, user)
                            .compose(documentIds -> this.workspaceService.setShareRights(documentIds, share)
                                    .onFailure(fail -> {
                                        log.error(String.format("[Magneto@%s::handleShareBoard] Failed to share board documents %s",
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

                                        newSharedElem.addAll(bookmarkShared);
                                        this.boardService.shareBoard(ids, share, false)
                                                .compose(success -> getUsersIdsToNotify(user, newSharedElem)
                                                        .onSuccess(usersIdToShare -> {
                                                            notification.notifyTimeline(request, "magneto.share_board", user, usersIdToShare, id, Field.TITLE,
                                                                    params, true);
                                                            request.response().setStatusMessage(id).setStatusCode(200).end();
                                                        }).onFailure(error -> badRequest(request, error.getMessage())));
                                    }));

                } else {
                    forbidden(request, "Can't apply this rights");
                }
            });
        }).onFailure(error -> badRequest(request, error.getMessage()));

    }

    private Future<List<String>> getUsersIdsToNotify(UserInfos user, List<SharedElem> newSharedElem) {
        List<String> usersIdToShare = new ArrayList<>();
        Promise<List<String>> promise = Promise.promise();
        List<Future<List<String>>> futures = new ArrayList<>();
        newSharedElem.forEach(elem -> {
            if (elem.getTypeId().equals(Field.USERID)) {
                usersIdToShare.add(elem.getId());
            }
            if (elem.getTypeId().equals(Field.GROUPID)) {
                futures.add(getGroupUsers(user, elem.getId()));
            }
            if (elem.getTypeId().equals(Field.BOOKMARKID)) {
                shareBookMarkService.get(user.getUserId(), elem.getId()).onSuccess(event -> {
                    if (event.containsKey(Field.MEMBERS) && !event.getJsonArray(Field.MEMBERS).isEmpty())
                        futures.add(getBookmarkUserId(user, event.getJsonArray(Field.MEMBERS)));
                });
            }
        });
        return handlePromiseWithCompositeFuture(promise, futures, usersIdToShare);
    }

    private Future<List<String>> getBookmarkUserId(UserInfos user, JsonArray members) {
        Promise<List<String>> promise = Promise.promise();
        List<Future<List<String>>> futures = new ArrayList<>();
        List<String> usersIdToShare = new ArrayList<>();
        members.forEach(elem -> {
            JsonObject elemJO = (JsonObject) elem;
            if (elemJO.containsKey(Field.GROUP_TYPE)) {
                if (elemJO.getJsonArray(Field.GROUP_TYPE).contains(Field.USER_2)) {
                    usersIdToShare.add(elemJO.getString(Field.ID));
                } else if (elemJO.getJsonArray(Field.GROUP_TYPE).contains(Field.GROUP)) {
                    futures.add(getGroupUsers(user, elemJO.getString(Field.ID)));
                }
            }
        });
        return handlePromiseWithCompositeFuture(promise, futures, usersIdToShare);
    }

    private Future<List<SharedElem>> getBookmarksToElems(UserInfos user, List<SharedElem> members) {
        Promise<List<SharedElem>> promise = Promise.promise();
        List<Future<List<SharedElem>>> futures = new ArrayList<>();
        List<SharedElem> sharedElems = members.stream().filter(elem -> elem.getTypeId().equals(Field.BOOKMARKID)).collect(Collectors.toList());
        sharedElems.forEach(elem -> futures.add(getBookmarkToElems(user, elem)));

        FutureHelper.all(futures)
                .onSuccess(result -> promise.complete(result.list().stream().flatMap(elem -> ((List<SharedElem>) elem).stream()).collect(Collectors.toList())))
                .onFailure(error -> promise.fail(error.getMessage()));
        return promise.future();
    }

    private Future<List<SharedElem>> getBookmarkToElems(UserInfos user, SharedElem elem) {
        Promise<List<SharedElem>> promise = Promise.promise();
        List<SharedElem> elems = new ArrayList<>();
        shareBookMarkService.get(user.getUserId(), elem.getId()).onSuccess(event -> {
            if (event.containsKey(Field.MEMBERS) && !event.getJsonArray(Field.MEMBERS).isEmpty()) {
                event.getJsonArray(Field.MEMBERS).forEach(groupOrUserObject -> {
                    JsonObject groupOrUser = (JsonObject) groupOrUserObject;
                    if (groupOrUser.containsKey(Field.GROUP_TYPE)) {
                        if (groupOrUser.getJsonArray(Field.GROUP_TYPE).contains(Field.USER_2)) {
                            elems.add(createElemFromNeo(elem, groupOrUser.getString(Field.ID), Field.USERID));
                        } else if (groupOrUser.getJsonArray(Field.GROUP_TYPE).contains(Field.GROUP)) {
                            elems.add(createElemFromNeo(elem, groupOrUser.getString(Field.ID), Field.GROUPID));
                        }
                    }
                });
            }
            promise.complete(elems);
        }).onFailure(error -> promise.fail(error.getMessage()));
        return promise.future();
    }

    private SharedElem createElemFromNeo(SharedElem elem, String id, String type) {
        SharedElem newElem = new SharedElem();
        newElem.setId(id);
        newElem.setTypeId(type);
        newElem.addAllRight(elem.getRights());
        return newElem;
    }

    private Future<List<String>> handlePromiseWithCompositeFuture(Promise<List<String>> promise, List<Future<List<String>>> futures, List<String> usersIdToShare) {
        if (!futures.isEmpty()) {
            FutureHelper.all(futures).onSuccess(
                    result -> promise.complete(result.list().stream().flatMap(elem -> ((List<String>) elem).stream()).collect(Collectors.toList()))
            ).onFailure(error -> promise.fail(error.getMessage()));
        } else {
            promise.complete(usersIdToShare);
        }
        return promise.future();
    }

    private Future<List<String>> getGroupUsers(UserInfos user, String id) {
        Promise<List<String>> promise = Promise.promise();
        UserUtils.findUsersInProfilsGroups(id, eb, user.getUserId(), false, event ->
                promise.complete(event.stream().map(elem -> ((JsonObject) elem).getString(Field.ID)).collect(Collectors.toList())));
        return promise.future();
    }

    private void handleShareFolder(HttpServerRequest request, UserInfos user, List<SharedElem> newSharedElem, String id, I18nHelper i18nHelper, JsonObject share) {

        Future<List<SharedElem>> deletedRightFuture = this.magnetoShareService.getDeletedRights(id, newSharedElem, CollectionsConstant.FOLDER_COLLECTION);
        this.getBookmarksToElems(user, newSharedElem)
                .onSuccess(bookmarkShared -> {
                    newSharedElem.addAll(bookmarkShared);
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

                                                        getUsersIdsToNotify(user, newSharedElem)
                                                                .onSuccess(usersIdToShare -> {
                                                                    notification.notifyTimeline(request, "magneto.share_board", user, usersIdToShare, id, Field.TITLE,
                                                                            params, true);
                                                                    request.response().setStatusMessage(id).setStatusCode(200).end();
                                                                }).onFailure(error -> badRequest(request, error.getMessage()));
                                                    })
                                                    .onFailure(error -> badRequest(request, error.getMessage()));
                                        } else {
                                            forbidden(request, "Can't apply this rights");
                                        }
                                    }
                            );
                });


    }


}