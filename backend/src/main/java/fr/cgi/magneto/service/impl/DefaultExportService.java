package fr.cgi.magneto.service.impl;

import java.util.Collections;

import org.entcore.common.user.UserInfos;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.enums.SlideResourceType;
import fr.cgi.magneto.factory.SlideFactory;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.properties.SlideProperties;
import fr.cgi.magneto.model.slides.Slide;
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
    public Future<JsonObject> exportBoardToPPTX(String boardId, UserInfos user) {
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

        JsonObject slideShowData = new JsonObject().put(Field.TITLE, board.getTitle())
                .put(Field.DESCRIPTION, board.getDescription()).put(Field.OWNERNAME, board.getOwnerName())
                .put(Field.MODIFICATIONDATE, board.getModificationDate())
                .put(Field.SHARED, board.getShared() != null && !board.getShared().isEmpty())
                .put(Field.MAGNET_NUMBER, board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections())
                .put(Field.ISPUBLIC, board.isPublic())
                .put(Field.SLIDE_OBJECTS, new JsonArray());
        return slideShowData;
    }

    private Future<JsonObject> createFreeLayoutSlideObjects(Board board, UserInfos user, JsonObject slideShowData) {
        return serviceFactory.cardService().getAllCardsByBoard(board, user)
                .map(cards -> {
                    JsonArray slideObjects = new JsonArray();
                    SlideFactory slideFactory = new SlideFactory();

                    for (Card card : cards) {
                        try {
                            slideObjects.add(createSlideFromCard(card, slideFactory, slideShowData));
                        } catch (IllegalArgumentException e) {
                            log.error(String.format(
                                    "[Magneto@%s::createFreeLayoutSlideObjects] Failed to create slide for card %s: %s",
                                    this.getClass().getSimpleName(), card.getId(), e.getMessage()));
                        }
                    }

                    return slideShowData.put(Field.SLIDE_OBJECTS, slideObjects);
                });
    }

    private Slide createSlideFromCard(Card card, SlideFactory slideFactory, JsonObject slideShowData) {
        SlideProperties.Builder propertiesBuilder = new SlideProperties.Builder()
                .title(card.getTitle())
                .description(card.getDescription());

        SlideResourceType resourceType = SlideResourceType.valueOf(card.getResourceType());
        switch (resourceType) {
            case DEFAULT:
            case TEXT:
                break;
            case FILE:
            case PDF:
            case SHEET:
                propertiesBuilder
                        .url(card.getResourceUrl())
                        .fileName(card.getMetadata() != null ? card.getMetadata().getFilename() : "");
                break;
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                propertiesBuilder.url(card.getResourceUrl());
                break;
            case IMAGE:
            case VIDEO:
            case AUDIO:
                propertiesBuilder
                        .url(card.getResourceUrl())
                        .fileName(card.getMetadata() != null ? card.getMetadata().getFilename() : "");
                break;
            case BOARD:
                propertiesBuilder
                        .ownerName(slideShowData.getString(Field.OWNERNAME))
                        .modificationDate(slideShowData.getString(Field.MODIFICATIONDATE))
                        .resourceNumber(slideShowData.getInteger(Field.MAGNET_NUMBER))
                        .isShare(slideShowData.getBoolean(Field.SHARED))
                        .isPublic(slideShowData.getBoolean(Field.ISPUBLIC));
                break;
        }

        return slideFactory.createSlide(resourceType, propertiesBuilder.build());
    }
}