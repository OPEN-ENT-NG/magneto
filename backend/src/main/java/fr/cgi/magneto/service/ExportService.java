package fr.cgi.magneto.service;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.entcore.common.user.UserInfos;

import io.vertx.core.Future;

public interface ExportService {

    /**
     * Export board to PPTX
     *
     * @param boardId Board identifier
     * @return Future {@link Future<JsonObject>} containing board id
     */
    Future<XMLSlideShow> exportBoardToPPTX(String boardId, UserInfos user);
}
