package fr.cgi.magneto.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserUtils;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.service.ExportService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.buffer.Buffer;
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
        UserUtils.getUserInfos(eb, request, user -> {
            exportService.exportBoardToPPTX(boardId, user)
                    .onFailure(err -> renderError(request))
                    .onSuccess(ppt -> {
                        try {
                            request.response()
                                    .putHeader("Content-Type",
                                            "application/vnd.openxmlformats-officedocument.presentationml.presentation")
                                    .putHeader("Content-Disposition", "attachment; filename=\"board.pptx\"");

                            ByteArrayOutputStream out = new ByteArrayOutputStream();
                            ppt.write(out);
                            request.response().end(Buffer.buffer(out.toByteArray()));
                        } catch (IOException e) {
                            log.error("Error writing PPTX", e);
                            renderError(request);
                        }
                    });
        });
    }
}