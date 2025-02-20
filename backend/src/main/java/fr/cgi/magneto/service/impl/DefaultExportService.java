package fr.cgi.magneto.service.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
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
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.buffer.Buffer;
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
    public Future<XMLSlideShow> exportBoardToPPTX(String boardId, UserInfos user) {
        return serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                    if (boards.isEmpty()) {
                        String message = String.format("[Magneto@%s::exportBoardToPptx] No board found with id %s",
                                this.getClass().getSimpleName(), boardId);
                        log.error(message, new Throwable(message));
                        return Future.failedFuture(message);
                    }
                    Board board = boards.get(0);
                    JsonObject slideShow = createSlideShowObject(board);

                    // D'abord on récupère les documents
                    return serviceFactory.boardService()
                            .getAllDocumentIds(boardId, user)
                            .compose(documentIds -> {
                                if (documentIds.isEmpty()) {
                                    return Future.succeededFuture(new ArrayList<>());
                                }
                                return getBoardDocuments(documentIds);
                            })
                            .compose(documents -> createFreeLayoutSlideObjects(board, user, slideShow, documents))
                            .onFailure(err -> {
                                String message = String.format(
                                        "[Magneto@%s::exportBoardToPptx] Failed to get documents: %s",
                                        this.getClass().getSimpleName(), err.getMessage());
                                log.error(message);
                            });
                })
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportBoardToPptx] Failed to export board: %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                });
    }

    private JsonObject createSlideShowObject(Board board) {
        if (board == null) {
            log.error("[Magneto@%s::createSlideShowObject] Board is null", this.getClass().getSimpleName());
            return new JsonObject();
        }

        return new JsonObject()
                .put(Field.TITLE, board.getTitle())
                .put(Field.DESCRIPTION, board.getDescription())
                .put(Field.OWNERNAME, board.getOwnerName())
                .put(Field.MODIFICATIONDATE, board.getModificationDate())
                .put(Field.SHARED, board.getShared() != null && !board.getShared().isEmpty())
                .put(Field.MAGNET_NUMBER, board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections())
                .put(Field.ISPUBLIC, board.isPublic())
                .put(Field.SLIDE_OBJECTS, new JsonArray());
    }

    private Future<List<Map<String, Object>>> getBoardDocuments(List<String> documentIds) {
        List<Map<String, Object>> documents = new ArrayList<>();
        List<Future> futures = new ArrayList<>();

        for (String documentId : documentIds) {
            Future<Void> future = serviceFactory.workSpaceService().getDocument(documentId)
                    .compose(document -> {
                        String fileId = document.getString("file");
                        if (fileId == null) {
                            log.warn("File ID is null for document: " + documentId);
                            return Future.succeededFuture();
                        }

                        String filename = document.getJsonObject("metadata", new JsonObject())
                                .getString("filename", "");
                        String fileExtension = filename.contains(".")
                                ? filename.substring(filename.lastIndexOf(".") + 1)
                                : "";

                        return Future.<Void>future(promise -> {
                            serviceFactory.storage().readFile(fileId, buffer -> {
                                if (buffer != null) {
                                    Map<String, Object> docInfo = new HashMap<>();
                                    docInfo.put("documentId", documentId);
                                    docInfo.put("buffer", buffer);
                                    docInfo.put("extension", fileExtension);
                                    documents.add(docInfo);
                                    promise.complete();
                                } else {
                                    log.warn("Could not read file for document: " + documentId);
                                    promise.complete();
                                }
                            });
                        });
                    })
                    .recover(err -> {
                        log.warn("Error processing document " + documentId + ": " + err.getMessage());
                        return Future.succeededFuture();
                    });

            futures.add(future);
        }

        return CompositeFuture.all(futures)
                .map(v -> documents)
                .otherwiseEmpty();
    }

    private Future<XMLSlideShow> createFreeLayoutSlideObjects(Board board, UserInfos user,
            JsonObject slideShowData, List<Map<String, Object>> documents) {
        XMLSlideShow ppt = new XMLSlideShow();
        ppt.setPageSize(new java.awt.Dimension(1280, 720));

        return serviceFactory.cardService().getAllCardsByBoard(board, user)
                .map(fetchedCards -> {
                    // Créer une map des cartes récupérées pour un accès rapide
                    Map<String, Card> cardMap = fetchedCards.stream()
                            .collect(Collectors.toMap(Card::getId, card -> card));

                    SlideFactory slideFactory = new SlideFactory();

                    // Utiliser l'ordre des cartes du Board
                    for (Card boardCard : board.cards()) {
                        String cardId = boardCard.getId();
                        Card card = cardMap.get(cardId);
                        if (card != null) {
                            try {
                                Slide slide = createSlideFromCard(card, slideFactory, slideShowData, documents);
                                XSLFSlide apacheSlide = (XSLFSlide) slide.createApacheSlide();
                                ppt.createSlide().importContent(apacheSlide);
                            } catch (Exception e) {
                                String message = String.format(
                                        "[Magneto@%s::createFreeLayoutSlideObjects] Failed to create slide for card %s: %s",
                                        this.getClass().getSimpleName(), cardId, e.getMessage());
                                log.error(message);
                            }
                        } else {
                            log.warn(String.format("Card %s from board not found in fetched cards", cardId));
                        }
                    }
                    return ppt;
                })
                .onFailure(err -> {
                    String message = String.format(
                            "[Magneto@%s::createFreeLayoutSlideObjects] Failed to create slides: %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                });
    }

    private Slide createSlideFromCard(Card card, SlideFactory slideFactory, JsonObject slideShowData,
            List<Map<String, Object>> documents) {
        SlideProperties.Builder propertiesBuilder = new SlideProperties.Builder()
                .title(card.getTitle())
                .description(card.getDescription());

        SlideResourceType resourceType = SlideResourceType.fromString(card.getResourceType());
        switch (resourceType) {
            case DEFAULT:
            case TEXT:
                break;
            case FILE:
            case PDF:
            case SHEET:
                propertiesBuilder
                        .resourceUrl(card.getResourceUrl())
                        .fileName(card.getMetadata() != null ? card.getMetadata().getFilename() : "");
                break;
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                propertiesBuilder.resourceUrl(card.getResourceUrl());
                break;
            case IMAGE:
            case VIDEO:
            case AUDIO:
                Map<String, Map<String, Object>> documentMap = new HashMap<>();
                for (Map<String, Object> doc : documents) {
                    documentMap.put((String) doc.get("documentId"), doc);
                }
                Map<String, Object> documentData = documentMap.get(card.getResourceId());

                Buffer documentBuffer = documentData != null ? (Buffer) documentData.get("buffer") : null;
                String fileExtension = documentData != null ? (String) documentData.get("extension") : "";
                propertiesBuilder
                        .extension(fileExtension)
                        .resourceData(documentBuffer != null ? documentBuffer.getBytes() : null);
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