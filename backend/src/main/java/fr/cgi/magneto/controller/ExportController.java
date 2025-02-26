package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.service.ExportService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.webutils.I18n;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

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
            I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
            exportService.exportBoardToPPTX(boardId, user, i18nHelper)
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