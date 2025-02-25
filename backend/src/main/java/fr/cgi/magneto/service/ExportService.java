package fr.cgi.magneto.service;

import fr.cgi.magneto.helper.I18nHelper;
import io.vertx.core.Future;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.entcore.common.user.UserInfos;

public interface ExportService {

    /**
     * Export board to PPTX
     *
     * @param boardId Board identifier
     * @return Future {@link Future<JsonObject>} containing board id
     */
    Future<XMLSlideShow> exportBoardToPPTX(String boardId, UserInfos user, I18nHelper i18nHelper);
}
