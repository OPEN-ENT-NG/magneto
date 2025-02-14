package fr.cgi.magneto.controller;

import org.entcore.common.controller.ControllerHelper;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.service.ExportService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;

public class ExportController extends ControllerHelper {
    private final ExportService exportService;

    public ExportController(ServiceFactory serviceFactory) {
        this.exportService = serviceFactory.exportService();
    }

    @Get("/export/slide/:boardId")
    @ApiDoc("Export board to PPTX")
    public void exportBoardToPPTX(HttpServerRequest request) {
        String boardId = request.getParam(Field.BOARDID);
        exportService.exportBoardToPPTX(boardId)
                .onFailure(err -> renderError(request))
                .onSuccess(result -> renderJson(request, result));
    }
}