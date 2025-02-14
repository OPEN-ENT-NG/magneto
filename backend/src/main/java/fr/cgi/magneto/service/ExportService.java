package fr.cgi.magneto.service;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface ExportService {

    /**
     * Export board to PPTX
     *
     * @param boardId Board identifier
     * @return Future {@link Future<JsonObject>} containing board id
     */
    Future<JsonObject> exportBoardToPPTX(String boardId);
}
