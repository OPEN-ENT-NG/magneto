package fr.cgi.magneto.service.impl;

import java.util.Collections;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.service.ExportService;
import fr.cgi.magneto.service.ServiceFactory;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

public class DefaultExportService implements ExportService {

    protected static final Logger log = LoggerFactory.getLogger(DefaultExportService.class);
    private final ServiceFactory serviceFactory;

    public DefaultExportService(ServiceFactory serviceFactory) {
        this.serviceFactory = serviceFactory;
    }

    @Override
    public Future<JsonObject> exportBoardToPPTX(String boardId) {
        Promise<JsonObject> promise = Promise.promise();

        serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                    if (boards.isEmpty()) {
                        return Future
                                .failedFuture(String.format("[Magneto@%s::exportBoardToPptx] No board found with id %s",
                                        this.getClass().getSimpleName(), boardId));
                    }
                    Board board = boards.get(0);
                    return Future.succeededFuture(createSlideShowObject(board));
                })
                .onSuccess((promise::complete))
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportBoardToPptx] Failed to export board",
                            this.getClass().getSimpleName());
                    log.error(String.format("%s : %s", message, err.getMessage()));
                    promise.fail(err);
                });
        return promise.future();
    }

    private JsonObject createSlideShowObject(Board board) {
        if (board == null) {
            log.error("[Magneto@%s::createSlideShowObject] Board is null", this.getClass().getSimpleName());
            return new JsonObject();
        }
        Boolean isFreeLayout = board.getLayoutType() == Field.FREE;
        // TODO conditionnel pour le magnet number sur le type de layout
        JsonObject slideShowData = new JsonObject().put(Field.TITLE, board.getTitle())
                .put(Field.DESCRIPTION, board.getDescription()).put(Field.OWNERNAME, board.getOwnerName())
                .put(Field.MODIFICATIONDATE, board.getModificationDate())
                .put(Field.SHARED, board.getShared() != null && !board.getShared().isEmpty())
                .put(Field.MAGNET_NUMBER, isFreeLayout ? board.getNbCards() : board.getNbCardsSections())
                .put(Field.ISPUBLIC, board.isPublic())
                .put(Field.SLIDE_OBJECT, new JsonArray());
        return slideShowData;
    }
}