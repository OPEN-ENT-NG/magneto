package fr.cgi.magneto.service.impl;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.entcore.common.user.UserInfos;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.core.enums.SlideResourceType;
import fr.cgi.magneto.factory.SlideFactory;
import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.helper.SlideHelper;
import fr.cgi.magneto.model.Section;
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
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.*;

public class DefaultExportService implements ExportService {

    protected static final Logger log = LoggerFactory.getLogger(DefaultExportService.class);
    private final ServiceFactory serviceFactory;

    public DefaultExportService(ServiceFactory serviceFactory) {
        this.serviceFactory = serviceFactory;
    }

    @Override
    public Future<XMLSlideShow> exportBoardToPPTX(String boardId, UserInfos user, I18nHelper i18nHelper) {
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
                                String imageUrl = board.getImageUrl();
                                String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                                documentIds.add(imageId);
                                return getBoardDocuments(documentIds);
                            })
                            .compose(documents -> board.isLayoutFree()
                                    ? createFreeLayoutSlideObjects(board, user, slideShow, documents,
                                    i18nHelper)
                                    : createSectionLayoutSlideObjects(board, user, slideShow, documents, i18nHelper))
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
            Future<Void> future = fetchDocumentFile(documentId, documents);
            futures.add(future);
        }

        return CompositeFuture.all(futures)
                .map(v -> documents)
                .otherwiseEmpty();
    }

    private Future<Void> fetchDocumentFile(String documentId, List<Map<String, Object>> documents) {
        return serviceFactory.workSpaceService().getDocument(documentId)
                .compose(document -> {
                    String fileId = document.getString(Field.FILE);
                    if (fileId == null) {
                        log.warn("File ID is null for document: " + documentId);
                        return Future.succeededFuture();
                    }

                    JsonObject metadata = document.getJsonObject(Field.METADATA, new JsonObject());
                    return Future.<Void>future(promise -> {
                        serviceFactory.storage().readFile(fileId, buffer -> {
                            if (buffer != null) {
                                Map<String, Object> docInfo = new HashMap<>();
                                docInfo.put(Field.DOCUMENTID, documentId);
                                docInfo.put(Field.BUFFER, buffer);
                                docInfo.put(Field.CONTENTTYPE, metadata.getString(Field.CONTENT_TYPE, ""));
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
    }

    private Future<XMLSlideShow> createFreeLayoutSlideObjects(Board board, UserInfos user,
            JsonObject slideShowData, List<Map<String, Object>> documents, I18nHelper i18nHelper) {
        XMLSlideShow ppt = new XMLSlideShow();
        ppt.setPageSize(new java.awt.Dimension(1280, 720));

        // TITRE
        XSLFSlide newTitleSlide = ppt.createSlide();
        createTitleSlide(newTitleSlide, board, documents, i18nHelper);
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
                                XSLFSlide newSlide = ppt.createSlide();
                                slide.createApacheSlide(newSlide);
                                // Inspecter le contenu du package après l'ajout de la diapositive
                                log.info("Package parts after adding slide:");
                                for (PackagePart part : ppt.getPackage().getParts()) {
                                    log.info("- " + part.getPartName());
                                }
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


    private Future<XMLSlideShow> createSectionLayoutSlideObjects(Board board, UserInfos user,
                                                                 JsonObject slideShowData, List<Map<String, Object>> documents, I18nHelper i18nHelper) {
        XMLSlideShow ppt = new XMLSlideShow();
        ppt.setPageSize(new java.awt.Dimension(1280, 720));

        // TITRE
        XSLFSlide titleApacheSlide = createTitleSlide(board, documents, i18nHelper);
        ppt.createSlide().importContent(titleApacheSlide);

        SlideFactory slideFactory = new SlideFactory();

        return this.serviceFactory.sectionService().createSectionWithCards(board, user)
                .map(sections -> {
                    for (Section section : sections) {
                        // TITRE SECTION
                        XSLFSlide sectionApacheSlide = ppt.createSlide();
                        SlideHelper.createTitle(sectionApacheSlide, section.getTitle(), Slideshow.MAIN_TITLE_HEIGHT, Slideshow.MAIN_TITLE_FONT_SIZE, TextParagraph.TextAlign.CENTER);

                        for (Card card : section.getCards()) {
                            if (card != null) {
                                try {
                                    Slide slide = createSlideFromCard(card, slideFactory, slideShowData, documents);
                                    XSLFSlide apacheSlide = (XSLFSlide) slide.createApacheSlide();
                                    ppt.createSlide().importContent(apacheSlide);
                                } catch (Exception e) {
                                    String message = String.format(
                                            "[Magneto@%s::createSectionLayoutSlideObjects] Failed to create slide for card %s: %s",
                                            this.getClass().getSimpleName(), card.getId(), e.getMessage());
                                    log.error(message);
                                }
                            } else {
                                log.warn(String.format("Card %s from board not found in fetched cards", card.getId()));
                            }
                        }
                    }
                    return ppt;
                })
                .onFailure(err -> {
                    String message = String.format(
                            "[Magneto@%s::createSectionLayoutSlideObjects] Failed to create slides: %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                });
    }

    private XSLFSlide createTitleSlide(XSLFSlide newTitleSlide, Board board, List<Map<String, Object>> documents,
            I18nHelper i18nHelper) {

        SlideHelper.createTitle(newTitleSlide, board.getTitle(), Slideshow.MAIN_TITLE_HEIGHT,
                Slideshow.MAIN_TITLE_FONT_SIZE, TextParagraph.TextAlign.CENTER);

        XSLFTextBox textBox = SlideHelper.createContent(newTitleSlide);

        XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
        paragraph.setTextAlign(TextParagraph.TextAlign.CENTER);
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(i18nHelper.translate("magneto.slideshow.created.by") + board.getOwnerName() + ",");
        textRun.setFontSize(Slideshow.CONTENT_FONT_SIZE);

        XSLFTextParagraph paragraph2 = textBox.addNewTextParagraph();
        paragraph2.setTextAlign(TextParagraph.TextAlign.CENTER);
        XSLFTextRun textRun2 = paragraph2.addNewTextRun();
        textRun2.setText(i18nHelper.translate("magneto.slideshow.updated.the") + board.getModificationDate());
        textRun2.setFontSize(Slideshow.CONTENT_FONT_SIZE);

        String imageUrl = board.getImageUrl();
        String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Map<String, Object> documentData = documents.stream()
                .filter(doc -> imageId.equals(doc.get(Field.DOCUMENTID)))
                .findFirst()
                .orElse(null);
        if (documentData != null) {
            Buffer documentBuffer = (Buffer) documentData.get(Field.BUFFER);
            String fileExtension = (String) documentData.get(Field.EXTENSION);
            if (documentBuffer != null) {
                SlideHelper.createImage(newTitleSlide, documentBuffer.getBytes(), fileExtension,
                        Slideshow.MAIN_CONTENT_MARGIN_TOP, Slideshow.MAIN_IMAGE_CONTENT_HEIGHT);
            }
        }
        return newTitleSlide;
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
                    documentMap.put((String) doc.get(Field.DOCUMENTID), doc);
                }
                Map<String, Object> documentData = documentMap.get(card.getResourceId());

                Buffer documentBuffer = documentData != null ? (Buffer) documentData.get(Field.BUFFER) : null;
                String contentType = documentData != null ? (String) documentData.get(Field.CONTENTTYPE) : "";

                propertiesBuilder
                        .contentType(contentType)
                        .resourceData(documentBuffer != null ? documentBuffer.getBytes() : null)
                        .caption(card.getCaption());
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