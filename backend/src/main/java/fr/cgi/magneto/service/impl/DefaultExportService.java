package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.MagnetoPaths;
import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.core.enums.FileFormatManager;
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
import org.apache.commons.io.IOUtils;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.entcore.common.user.UserInfos;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.enums.FileFormatManager.getFormatFromExtension;

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

        SlideFactory slideFactory = new SlideFactory();

        // TITRE
        Slide titleSlide = createTitleSlide(board, slideFactory, documents, i18nHelper);
        XSLFSlide newTitleSlide = ppt.createSlide();
        titleSlide.createApacheSlide(newTitleSlide);

        // DESCRIPTION
        Slide descriptionSlide = createDescriptionSlide(board, slideFactory, i18nHelper);
        XSLFSlide newDescriptionSlide = ppt.createSlide();
        descriptionSlide.createApacheSlide(newDescriptionSlide);

        return serviceFactory.cardService().getAllCardsByBoard(board, user)
                .compose(fetchedCards -> {
                    Map<String, Card> cardMap = fetchedCards.stream()
                            .collect(Collectors.toMap(Card::getId, card -> card));

                    // Créer un Future initial qui réussit immédiatement
                    Future<Void> cardProcessingFuture = Future.succeededFuture();

                    // Traiter les cartes en séquence en chaînant les Futures
                    for (Card boardCard : board.cards()) {
                        String cardId = boardCard.getId();
                        Card card = cardMap.get(cardId);

                        if (card != null) {
                            // Capture la variable pour l'utiliser dans la lambda
                            final Card finalCard = card;

                            // Ajouter cette carte à la chaîne de traitements
                            cardProcessingFuture = cardProcessingFuture.compose(v -> {
                                try {
                                    return processCardResourceType(finalCard, slideFactory, slideShowData, documents,
                                            ppt, i18nHelper);
                                } catch (Exception e) {
                                    log.error("Failed to process card: " + finalCard.getId(), e);
                                    return Future.succeededFuture(); // Continue avec la prochaine carte
                                }
                            });
                        }
                    }

                    // Retourner le ppt une fois que toutes les cartes ont été traitées
                    return cardProcessingFuture.map(v -> ppt);
                });
    }

    private Future<XMLSlideShow> createSectionLayoutSlideObjects(Board board, UserInfos user,
                                                                 JsonObject slideShowData, List<Map<String, Object>> documents, I18nHelper i18nHelper) {
        XMLSlideShow ppt = new XMLSlideShow();
        ppt.setPageSize(new java.awt.Dimension(1280, 720));

        SlideFactory slideFactory = new SlideFactory();

        // TITRE
        Slide titleSlide = createTitleSlide(board, slideFactory, documents, i18nHelper);
        XSLFSlide newTitleSlide = ppt.createSlide();
        titleSlide.createApacheSlide(newTitleSlide);

        // DESCRIPTION
        Slide descriptionSlide = createDescriptionSlide(board, slideFactory, i18nHelper);
        XSLFSlide newDescriptionSlide = ppt.createSlide();
        descriptionSlide.createApacheSlide(newDescriptionSlide);

        return this.serviceFactory.sectionService().createSectionWithCards(board, user)
                .compose(sections -> {
                    // Créer un Future initial qui réussit immédiatement
                    Future<XMLSlideShow> processingFuture = Future.succeededFuture(ppt);

                    // Traiter chaque section et ses cartes séquentiellement
                    for (Section section : sections) {
                        processingFuture = processingFuture.compose(currentPpt -> {
                            // TITRE SECTION
                            XSLFSlide sectionApacheSlide = currentPpt.createSlide();
                            SlideHelper.createTitle(sectionApacheSlide, section.getTitle(),
                                    Slideshow.MAIN_TITLE_HEIGHT,
                                    Slideshow.MAIN_TITLE_FONT_SIZE,
                                    TextParagraph.TextAlign.CENTER);

                            // Future pour le traitement séquentiel des cartes de cette section
                            Future<XMLSlideShow> sectionFuture = Future.succeededFuture(currentPpt);

                            for (Card card : section.getCards()) {
                                if (card != null) {
                                    final Card finalCard = card;
                                    sectionFuture = sectionFuture.compose(pptInProgress ->
                                            processCardResourceType(finalCard, slideFactory, slideShowData,
                                                    documents, pptInProgress, i18nHelper)
                                                    .map(v -> pptInProgress) // Retourne toujours la présentation
                                                    .recover(err -> {
                                                        log.error("Failed to process card: " + finalCard.getId(), err);
                                                        return Future.succeededFuture(pptInProgress); // Continue avec la prochaine carte
                                                    })
                                    );
                                }
                            }

                            return sectionFuture;
                        });
                    }

                    return processingFuture;
                })
                .onFailure(err -> {
                    String message = String.format(
                            "[Magneto@%s::createSectionLayoutSlideObjects] Failed to create slides: %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                });
    }

    private Slide createSlideFromCard(Card card, SlideFactory slideFactory,
            List<Map<String, Object>> documents, JsonObject referencedBoardData, I18nHelper i18nHelper) {
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
                try {
                    ClassLoader classLoader = getClass().getClassLoader();
                    FileFormatManager.FileFormat format = getFormatFromExtension(card.getMetadata().getExtension());
                    InputStream inputStream = classLoader.getResourceAsStream("img/extension/link.svg");
                    //TODO : récupérer le bon SVG selon le type de fichier (cf ce qui est fait en front)

                    if (inputStream != null) {
                        byte[] svgData = IOUtils.toByteArray(inputStream);

                        propertiesBuilder
                                .fileName(card.getMetadata() != null ? card.getMetadata().getFilename() : "")
                                .caption(card.getCaption())
                                .resourceData(svgData); //TODO : mettre contenttype?
                    } else {
                        log.warn("SVG file not found in resources");
                        // Traitement alternatif si le fichier n'est pas trouvé
                    }
                } catch (IOException e) {
                    log.error("Failed to load SVG file", e);
                }
                break;
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                try {
                    ClassLoader classLoader = getClass().getClassLoader();
                    InputStream inputStream = classLoader.getResourceAsStream("img/extension/link.svg");

                    if (inputStream != null) {
                        byte[] svgData = IOUtils.toByteArray(inputStream);

                        propertiesBuilder
                                .resourceUrl(card.getResourceUrl())
                                .caption(card.getCaption())
                                .resourceData(svgData)
                                .contentType("image/svg+xml");
                    } else {
                        log.warn("SVG file not found in resources");
                        // Traitement alternatif si le fichier n'est pas trouvé
                    }
                } catch (IOException e) {
                    log.error("Failed to load SVG file", e);
                }
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
                if (referencedBoardData != null) {
                    JsonObject i18nValues = new JsonObject()
                            .put(CollectionsConstant.I18N_SLIDESHOW_OWNER,
                                    i18nHelper.translate(CollectionsConstant.I18N_SLIDESHOW_OWNER))
                            .put(CollectionsConstant.I18N_SLIDESHOW_UPDATED,
                                    i18nHelper.translate(CollectionsConstant.I18N_SLIDESHOW_UPDATED))
                            .put(CollectionsConstant.I18N_SLIDESHOW_MAGNETS,
                                    i18nHelper.translate(CollectionsConstant.I18N_SLIDESHOW_MAGNETS))
                            .put(CollectionsConstant.I18N_SLIDESHOW_SHARED,
                                    i18nHelper.translate(CollectionsConstant.I18N_SLIDESHOW_SHARED))
                            .put(CollectionsConstant.I18N_SLIDESHOW_PLATFORM,
                                    i18nHelper.translate(CollectionsConstant.I18N_SLIDESHOW_PLATFORM));

                    String boardImageId = referencedBoardData.getString(Field.BOARD_IMAGE_ID, "");

                    // Créer une map pour un accès rapide aux documents par ID
                    Map<String, Map<String, Object>> boardDocumentMap = new HashMap<>();
                    for (Map<String, Object> doc : documents) {
                        boardDocumentMap.put((String) doc.get(Field.DOCUMENTID), doc);
                    }

                    // Récupérer les données de l'image
                    Map<String, Object> imageDocumentData = boardDocumentMap.get(boardImageId);
                    Buffer imageBuffer = null;
                    String imageContentType = "";

                    if (imageDocumentData != null) {
                        imageBuffer = (Buffer) imageDocumentData.get(Field.BUFFER);
                        imageContentType = (String) imageDocumentData.get(Field.CONTENTTYPE);
                    }

                    propertiesBuilder
                            .title(referencedBoardData.getString(Field.TITLE))
                            .description(referencedBoardData.getString(Field.DESCRIPTION))
                            .caption(card.getCaption())
                            .ownerName(referencedBoardData.getString(Field.OWNERNAME))
                            .modificationDate(referencedBoardData.getString(Field.MODIFICATIONDATE))
                            .resourceNumber(referencedBoardData.getInteger(Field.MAGNET_NUMBER))
                            .isShare(referencedBoardData.getBoolean(Field.SHARED))
                            .link(processBoardUrl(card.getResourceUrl()))
                            .contentType(imageContentType)
                            .resourceData(imageBuffer != null ? imageBuffer.getBytes() : null)
                            .isPublic(referencedBoardData.getBoolean(Field.ISPUBLIC))
                            .i18ns(i18nValues);
                }
                break;
        }

        return slideFactory.createSlide(resourceType, propertiesBuilder.build());
    }

    private Future<Void> processCardResourceType(Card card, SlideFactory slideFactory, JsonObject slideShowData,
            List<Map<String, Object>> documents, XMLSlideShow ppt, I18nHelper i18nHelper) {
        if (SlideResourceType.BOARD.getValue().equals(card.getResourceType())) {
            return serviceFactory.boardService()
                    .getBoards(Collections.singletonList(card.getResourceUrl()))
                    .compose(boards -> {
                        if (boards.isEmpty()) {
                            return Future.succeededFuture();
                        }

                        Board referencedBoard = boards.get(0);
                        JsonObject referencedSlideShow = createSlideShowObject(referencedBoard);

                        String imageUrl = referencedBoard.getImageUrl();
                        if (imageUrl == null || imageUrl.isEmpty()) {
                            Slide slide = createSlideFromCard(card, slideFactory,
                                    documents, referencedSlideShow, i18nHelper);
                            XSLFSlide newSlide = ppt.createSlide();
                            slide.createApacheSlide(newSlide);
                            return Future.succeededFuture();
                        }

                        String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                        referencedSlideShow.put(Field.BOARD_IMAGE_ID, imageId);

                        boolean imageExists = documents.stream()
                                .anyMatch(doc -> imageId.equals(doc.get(Field.DOCUMENTID)));

                        if (!imageExists) {
                            return fetchDocumentFile(imageId, documents)
                                    .compose(v -> {
                                        Slide slide = createSlideFromCard(card, slideFactory,
                                                documents, referencedSlideShow, i18nHelper);
                                        XSLFSlide newSlide = ppt.createSlide();
                                        slide.createApacheSlide(newSlide);
                                        return Future.succeededFuture();
                                    });
                        } else {
                            Slide slide = createSlideFromCard(card, slideFactory,
                                    documents, referencedSlideShow, i18nHelper);
                            XSLFSlide newSlide = ppt.createSlide();
                            slide.createApacheSlide(newSlide);
                            return Future.succeededFuture();
                        }
                    });
        } else {
            Slide slide = createSlideFromCard(card, slideFactory, documents, null, i18nHelper);
            XSLFSlide newSlide = ppt.createSlide();
            slide.createApacheSlide(newSlide);
            return Future.succeededFuture();
        }
    }

    private String processBoardUrl(String boardId) {
        if (boardId == null || boardId.isEmpty()) {
            return "";
        }

        String baseUrl = serviceFactory.magnetoConfig().host();

        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }

        return baseUrl + MagnetoPaths.MAGNETO_BOARD + boardId + MagnetoPaths.VIEW;
    }

    private Slide createTitleSlide(Board board, SlideFactory slideFactory, List<Map<String, Object>> documents,
                                   I18nHelper i18nHelper) {
        SlideProperties.Builder propertiesBuilder = new SlideProperties.Builder()
                .title(board.getTitle())
                .description(board.getDescription());

        String imageUrl = board.getImageUrl();
        String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Map<String, Object> documentData = documents.stream()
                .filter(doc -> imageId.equals(doc.get(Field.DOCUMENTID)))
                .findFirst()
                .orElse(null);
        Buffer documentBuffer = (Buffer) documentData.get(Field.BUFFER);
        String contentType = documentData != null ? (String) documentData.get(Field.CONTENTTYPE) : "";

        propertiesBuilder
                .ownerName(i18nHelper.translate("magneto.slideshow.created.by") + board.getOwnerName() + ",")
                .modificationDate(i18nHelper.translate("magneto.slideshow.updated.the") + board.getModificationDate())
                .resourceData(documentBuffer != null ? documentBuffer.getBytes() : null)
                .contentType(contentType);

        return slideFactory.createSlide(SlideResourceType.TITLE, propertiesBuilder.build());
    }

    private Slide createDescriptionSlide(Board board, SlideFactory slideFactory,
                                   I18nHelper i18nHelper) {
        SlideProperties.Builder propertiesBuilder = new SlideProperties.Builder()
                .title(i18nHelper.translate("magneto.create.board.description"))
                .description(board.getDescription());

        return slideFactory.createSlide(SlideResourceType.DESCRIPTION, propertiesBuilder.build());
    }
}