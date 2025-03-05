package fr.cgi.magneto.service;

import fr.cgi.magneto.helper.I18nHelper;
import io.vertx.core.Future;
import org.entcore.common.user.UserInfos;

import java.io.ByteArrayOutputStream;

public interface ExportService {

    /**
     * Export board to PPTX
     *
     * @param boardId Board identifier
     * @return Future {@link Future<ByteArrayOutputStream>} containing board id
     */
    Future<ByteArrayOutputStream> exportBoardToArchive(String boardId, UserInfos user, I18nHelper i18nHelper);
}
