package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.service.ExportService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.impl.DefaultExportService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.webutils.I18n;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.Json;

import java.util.List;

import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.user.UserUtils;

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
            exportService.exportBoardToArchive(boardId, user, i18nHelper)
                    .onFailure(err -> renderError(request))
                    .onSuccess(zip -> {
                        request.response()
                                .putHeader("Content-Type", "application/zip")
                                .putHeader("Content-Disposition", "attachment; filename=\"board.zip\"");
                        if (exportService instanceof DefaultExportService) {
                            DefaultExportService defaultExportService = (DefaultExportService) exportService;
                            List<String> cardsWithErrors = defaultExportService.getCardsWithErrors();
                            if (!cardsWithErrors.isEmpty()) {
                                if (!cardsWithErrors.isEmpty()) {
                                    String jsonTitles = Json.encode(cardsWithErrors);
                                    request.response().putHeader("X-Cards-With-Errors", jsonTitles);
                                }
                            }
                        }

                        request.response().end(Buffer.buffer(zip.toByteArray()));
                    });
        });
    }
}