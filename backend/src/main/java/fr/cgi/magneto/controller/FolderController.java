package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.FolderPayload;
import fr.cgi.magneto.security.CreateFolderRight;
import fr.cgi.magneto.security.DeleteFolderRight;
import fr.cgi.magneto.security.ManageFolderRight;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.service.FolderService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.List;

public class FolderController extends ControllerHelper {

    private final FolderService folderService;

    public FolderController(ServiceFactory serviceFactory) {
        this.folderService = serviceFactory.folderService();
    }

    @Get("/folders")
    @ApiDoc("Get user folders")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getFolders(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            boolean isDeleted = Boolean.parseBoolean(request.getParam(Field.ISDELETED));
            folderService.getFolders(user, isDeleted)
                        .onSuccess(result -> renderJson(request, result))
                        .onFailure(fail -> {
                            String message = String.format("[Magneto@%s::getFolders] Failed to get user folders : %s",
                                    this.getClass().getSimpleName(), fail.getMessage());
                            log.error(message);
                            renderError(request);
                        });
        });
    }

    @Post("/folder")
    @ApiDoc("Create a folder")
    @ResourceFilter(CreateFolderRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createFolder(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "folder", folder ->
                UserUtils.getUserInfos(eb, request, user -> {
                    FolderPayload folderCreate = new FolderPayload(folder);
                    folderCreate.setOwnerId(user.getUserId());
                        folderService.createFolder(folderCreate)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }

    @Put("/folder/:folderId")
    @ApiDoc("Update a folder")
    @ResourceFilter(ManageFolderRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updateFolder(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "folder", folder -> {
                    String folderId = request.getParam(Field.FOLDERID);
                    FolderPayload folderPayload = new FolderPayload(folder).setId(folderId);
                    folderService.updateFolder(folderPayload)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                });
    }


    @Delete("/folders")
    @ApiDoc("Delete folders")
    @ResourceFilter(DeleteFolderRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void deleteFolders(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteFolder", folders ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> folderIds = folders.getJsonArray(Field.FOLDERIDS).getList();
                        folderService.deleteFoldersAndBoards(user, folderIds)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }

    @Put("/folders/predelete")
    @ApiDoc("Pre-delete folders")
    @ResourceFilter(DeleteFolderRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void preDeleteFolders(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteFolder", folders ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> folderIds = folders.getJsonArray(Field.FOLDERIDS).getList();
                        folderService.preDeleteFoldersAndBoards(user, folderIds, false)
                                .onFailure(err -> renderError(request))
                                .onSuccess(result -> renderJson(request, result));
                }));
    }

    @Put("/folders/restore")
    @ApiDoc("Restore pre-deleted folders")
    @ResourceFilter(DeleteFolderRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void restoreFolders(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteFolder", folders ->
                UserUtils.getUserInfos(eb, request, user -> {
                    List<String> folderIds = folders.getJsonArray(Field.FOLDERIDS).getList();
                    folderService.preDeleteFoldersAndBoards(user, folderIds, true)
                            .onFailure(err -> renderError(request))
                            .onSuccess(result -> renderJson(request, result));
                }));
    }

}
