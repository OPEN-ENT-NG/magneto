package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.security.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.*;
import fr.wseduc.security.*;
import io.vertx.core.http.*;
import io.vertx.core.json.*;
import org.entcore.common.controller.*;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class WorkspaceController extends ControllerHelper {

    private final WorkspaceService workspaceService;

    public WorkspaceController(ServiceFactory serviceFactory) {
        this.workspaceService = serviceFactory.workSpaceService();
    }

    @Get("/workspace/:documentId/canedit")
    @ApiDoc("Check if user can edit a document")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void canEditDocument(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String documentId = request.params().get(Field.DOCUMENTID);
            this.workspaceService.canEditDocument(user.getUserId(), documentId)
                    .onSuccess(result -> renderJson(request, new JsonObject().put(Field.CANEDIT, result)))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::canEditDocument] Failed to check if user can edit a document : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

}
