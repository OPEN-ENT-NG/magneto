package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.security.ContribBoardRight;
import fr.cgi.magneto.service.ExportService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.impl.DefaultExportService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.I18n;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.Json;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.List;

public class ExportController extends ControllerHelper {
    private final ExportService exportService;

    public ExportController(ServiceFactory serviceFactory) {
        this.exportService = serviceFactory.exportService();
    }

    @Get("/export/slide/:id")
    @ApiDoc("Export board to PPTX")
    @ResourceFilter(ContribBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void exportBoardToPPTX(HttpServerRequest request) {
        String boardId = request.getParam(Field.ID);
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

    @Get("/export/csv/:id")
    @ApiDoc("Export board to CSV")
    @ResourceFilter(ContribBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void exportBoardToCSV(HttpServerRequest request) {
        String boardId = request.getParam(Field.ID);

        UserUtils.getUserInfos(eb, request, user -> {
            exportService.exportBoardToCSV(boardId, user)
                    .onFailure(err -> {
                        log.error("[Magneto@ExportController::exportBoardToCSV] Failed to export board to CSV", err);
                        renderError(request);
                    })
                    .onSuccess(csvBuffer -> {
                        request.response()
                                .putHeader("Content-Type", "text/csv; charset=UTF-8")
                                .putHeader("Content-Disposition", "attachment; filename=\"board_" + boardId + ".csv\"")
                                .end(csvBuffer);
                    });
        });
    }
}