package fr.cgi.magneto.service;

import fr.cgi.magneto.helper.I18nHelper;
import io.vertx.core.Future;
import io.vertx.core.buffer.Buffer;
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

    /**
     * Export board to CSV
     *
     * @param boardId Board identifier
     * @param user User infos
     * @return Future {@link Future<Buffer>} containing the CSV completed
     */
    Future<Buffer> exportBoardToCSV(String boardId, UserInfos user, I18nHelper i18nHelper);
}
