package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.MagnetoPaths;
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
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.buffer.impl.BufferImpl;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.commons.io.IOUtils;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.entcore.common.user.UserInfos;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static fr.cgi.magneto.core.constants.Slideshow.CONTENT_TYPE_IMAGE_SVG_XML;
import static fr.cgi.magneto.core.constants.Slideshow.MAGNETO_SVG;
import static fr.cgi.magneto.core.enums.FileFormatManager.loadResourceForExtension;
import static fr.cgi.magneto.helper.SlideHelper.generateUniqueFileName;

public class DefaultExportService implements ExportService {

    protected static final Logger log = LoggerFactory.getLogger(DefaultExportService.class);
    private final ServiceFactory serviceFactory;

    public DefaultExportService(ServiceFactory serviceFactory) {
        this.serviceFactory = serviceFactory;
    }

    @Override
    public Future<ByteArrayOutputStream> exportBoardToArchive(String boardId, UserInfos user, I18nHelper i18nHelper) {
        Promise<ByteArrayOutputStream> promise = Promise.promise();

        resetCardsWithErrors();

        serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                    if (boards.isEmpty()) {
                        String message = String.format("[Magneto@%s::exportBoardToArchive] No board found with id %s",
                                this.getClass().getSimpleName(), boardId);
                        log.error(message, new Throwable(message));
                        return Future.failedFuture(message);
                    }
                    Board board = boards.get(0);
                    JsonObject slideShow = createSlideShowObject(board);

                    List<Map<String, Object>> documents = new ArrayList<>();

                    // D'abord on récupère les documents
                    return serviceFactory.boardService()
                            .getAllDocumentIds(boardId, user)
                            .compose(documentIds -> {
                                String imageUrl = board.getImageUrl();
                                String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                                documentIds.add(imageId);
                                return getBoardDocuments(documentIds);
                            })
                            .compose(docs -> {
                                documents.addAll(docs);
                                try {
                                    return board.isLayoutFree()
                                            ? createFreeLayoutSlideObjects(board, user, slideShow, documents, i18nHelper)
                                            : createSectionLayoutSlideObjects(board, user, slideShow, documents,
                                                    i18nHelper);
                                } catch (IOException e) {
                                    e.printStackTrace();
                                    return null;
                                }
                            })
                            .compose(pptx -> {
                                try {
                                    // Créer l'archive ZIP
                                    ByteArrayOutputStream archiveOutputStream = new ByteArrayOutputStream();
                                    ZipOutputStream zipOutputStream = new ZipOutputStream(archiveOutputStream);

                                    // Nettoyer le titre du board pour le nom de fichier
                                    String sanitizedTitle = board.getTitle().replaceAll("[\\\\/:*?\"<>|]", "_");

                                    // Ajouter le PPTX à la racine de l'archive avec un nom sécurisé
                                    ZipEntry pptxEntry = new ZipEntry(sanitizedTitle + ".pptx");
                                    zipOutputStream.putNextEntry(pptxEntry);
                                    ByteArrayOutputStream pptxOutputStream = new ByteArrayOutputStream();
                                    pptx.write(pptxOutputStream);
                                    zipOutputStream.write(pptxOutputStream.toByteArray());
                                    zipOutputStream.closeEntry();

                                    // Ajouter chaque document dans le dossier "Fichiers Liés"
                                    Set<String> usedFileNames = new HashSet<>();
                                    // On filtre les documents en double
                                    List<Map<String, Object>> uniqueDocuments = new ArrayList<>(documents.stream()
                                            .collect(Collectors.toMap(
                                                    doc -> (String) doc.get(Field.FILENAME), // clé
                                                    doc -> doc, // valeur
                                                    (doc1, doc2) -> doc1 // en cas de doublon, garde le premier
                                    ))
                                            .values());
                                    for (Map<String, Object> doc : uniqueDocuments) {
                                        // Déterminer l'extension de fichier basée sur le contentType
                                        String originalFileName = (String) doc.get(Field.FILENAME);
                                        String uniqueFileName = generateUniqueFileName(usedFileNames, originalFileName);
                                        String fullPath = "Fichiers liés/" + uniqueFileName;

                                        ZipEntry docEntry = new ZipEntry(fullPath);
                                        zipOutputStream.putNextEntry(docEntry);

                                        BufferImpl buffer = (BufferImpl) doc.get(Field.BUFFER);
                                        byte[] bytes = buffer.getBytes();

                                        zipOutputStream.write(bytes);
                                        zipOutputStream.closeEntry();
                                    }

                                    zipOutputStream.close();
                                    return Future.succeededFuture(archiveOutputStream);
                                } catch (Exception e) {
                                    String message = String.format(
                                            "[Magneto@%s::exportBoardToArchive] Failed to create archive: %s",
                                            this.getClass().getSimpleName(), e.getMessage());
                                    log.error(message, e);
                                    return Future.failedFuture(message);
                                }
                            })
                            .onSuccess(promise::complete)
                            .onFailure(err -> {
                                String message = String.format(
                                        "[Magneto@%s::exportBoardToArchive] Failed to get documents: %s",
                                        this.getClass().getSimpleName(), err.getMessage());
                                log.error(message);
                                promise.fail(message);
                            });
                })
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportBoardToArchive] Failed to export board: %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                    promise.fail(message);
                });

        return promise.future();
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
                                docInfo.put(Field.FILENAME, metadata.getString(Field.FILENAME, ""));
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

    private Future<XMLSlideShow> createFreeLayoutSlideObjects(Board board, UserInfos user,
            JsonObject slideShowData, List<Map<String, Object>> documents, I18nHelper i18nHelper) throws IOException {
        XMLSlideShow ppt = new XMLSlideShow();
        ppt.setPageSize(new java.awt.Dimension(1280, 720));

        SlideFactory slideFactory = new SlideFactory();

        // TITRE
        Slide titleSlide = createTitleSlide(board, slideFactory, documents, i18nHelper);
        XSLFSlide newTitleSlide = ppt.createSlide();
        titleSlide.createApacheSlide(newTitleSlide);

        // DESCRIPTION SI NON VIDE
        if (board.getDescription() != null && !board.getDescription().isEmpty()) {
            Slide descriptionSlide = createDescriptionSlide(board, slideFactory, i18nHelper);
            XSLFSlide newDescriptionSlide = ppt.createSlide();
            descriptionSlide.createApacheSlide(newDescriptionSlide);
        }

        return serviceFactory.cardService().getAllCardsByBoardWithSearch(board, user, null)
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
            JsonObject slideShowData, List<Map<String, Object>> documents, I18nHelper i18nHelper) throws IOException {
        XMLSlideShow ppt = new XMLSlideShow();
        ppt.setPageSize(new java.awt.Dimension(1280, 720));

        SlideFactory slideFactory = new SlideFactory();

        // TITRE
        Slide titleSlide = createTitleSlide(board, slideFactory, documents, i18nHelper);
        XSLFSlide newTitleSlide = ppt.createSlide();
        titleSlide.createApacheSlide(newTitleSlide);

        // DESCRIPTION SI NON VIDE
        if (board.getDescription() != null && !board.getDescription().isEmpty()) {
            Slide descriptionSlide = createDescriptionSlide(board, slideFactory, i18nHelper);
            XSLFSlide newDescriptionSlide = ppt.createSlide();
            descriptionSlide.createApacheSlide(newDescriptionSlide);
        }

        return this.serviceFactory.sectionService().createSectionWithCards(board, user)
                .compose(sections -> {
                    List<Section> displayedSections = sections.stream()
                            .filter(Section::getDisplayed)
                            .collect(Collectors.toList());

                    // Create a new ordered list based on board.sectionIds
                    List<Section> orderedSections = new ArrayList<>();
                    // Reorder sections according to board.sectionIds if available
                    if (board.sectionIds() != null && !board.sectionIds().isEmpty()) {
                        // Create a map for faster lookups
                        final Map<String, Section> sectionMap = displayedSections.stream()
                                .collect(Collectors.toMap(Section::getId, s -> s));

                        for (String sectionId : board.sectionIds()) {
                            if (sectionMap.containsKey(sectionId) && sectionMap.get(sectionId).getDisplayed()) {
                                orderedSections.add(sectionMap.get(sectionId));
                            }
                        }
                    }

                    // Créer un Future initial qui réussit immédiatement
                    Future<XMLSlideShow> processingFuture = Future.succeededFuture(ppt);

                    // Traiter chaque section non cachée et ses cartes séquentiellement
                    for (Section section : orderedSections.stream()
                            .filter(Section::getDisplayed)
                            .collect(Collectors.toList())) {
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
                                    sectionFuture = sectionFuture
                                            .compose(pptInProgress -> processCardResourceType(finalCard, slideFactory,
                                                    slideShowData,
                                                    documents, pptInProgress, i18nHelper)
                                                    .map(v -> pptInProgress) // Retourne toujours la présentation
                                                    .recover(err -> {
                                                        log.error("Failed to process card: " + finalCard.getId(), err);
                                                        return Future.succeededFuture(pptInProgress); // Continue avec
                                                                                                      // la prochaine
                                                                                                      // carte
                                                    }));
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
                    String svgSource = loadResourceForExtension(card.getMetadata().getExtension());
                    ClassLoader classLoader = getClass().getClassLoader();
                    InputStream inputStream = classLoader.getResourceAsStream(svgSource);

                    if (inputStream != null) {
                        byte[] svgData = IOUtils.toByteArray(inputStream);
                        String fileNameString = i18nHelper.translate(CollectionsConstant.I18N_SLIDESHOW_FILENAME)
                                + (card.getMetadata() != null ? card.getMetadata().getFilename() : "")
                                + "\nLe fichier est disponible dans le dossier « Fichiers liés ».";
                        propertiesBuilder
                                .fileNameString(fileNameString)
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
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                buildLink(card, propertiesBuilder, false);
                break;
            case IMAGE:
            case VIDEO:
            case AUDIO:
                // EMBEDDED LINK
                if (card.getResourceId() == null || card.getResourceId().isEmpty()) {
                    card.setResourceType(SlideResourceType.EMBEDDER.getValue());
                    resourceType = SlideResourceType.fromString(card.getResourceType());
                    buildLink(card, propertiesBuilder, true);
                } else {
                    // MEDIA
                    Map<String, Map<String, Object>> documentMap = new HashMap<>();
                    if (documents != null) {
                        for (Map<String, Object> doc : documents) {
                            if (doc != null && doc.get(Field.DOCUMENTID) != null) {
                                documentMap.put((String) doc.get(Field.DOCUMENTID), doc);
                            }
                        }
                    }

                    Map<String, Object> documentData = documentMap.get(card.getResourceId());

                    // Vérifier si documentData est null avant d'y accéder
                    Buffer documentBuffer = null;
                    String contentType = "";

                    if (documentData != null) {
                        documentBuffer = (Buffer) documentData.get(Field.BUFFER);
                        contentType = (String) documentData.get(Field.CONTENTTYPE);
                        if (contentType == null)
                            contentType = "";
                    }

                    propertiesBuilder
                            .contentType(contentType)
                            .resourceData(documentBuffer != null ? documentBuffer.getBytes() : null)
                            .caption(card.getCaption());
                }
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
                            .description(card.getDescription())
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

    private void buildLink(Card card, SlideProperties.Builder propertiesBuilder, boolean isFallback) {
        try {
            ClassLoader classLoader = getClass().getClassLoader();
            InputStream inputStream = classLoader.getResourceAsStream("img/extension/link.svg");
            InputStream fallBackStream = classLoader.getResourceAsStream("img/extension/video.svg");
            if (inputStream != null) {

                byte[] svgData = isFallback ? IOUtils.toByteArray(fallBackStream) : IOUtils.toByteArray(inputStream);

                propertiesBuilder
                        .resourceUrl(card.getResourceUrl().startsWith("/")
                                ? serviceFactory.magnetoConfig().host() + card.getResourceUrl()
                                : card.getResourceUrl())
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
    }

    private Future<Void> processCardResourceType(Card card, SlideFactory slideFactory, JsonObject slideShowData,
            List<Map<String, Object>> documents, XMLSlideShow ppt, I18nHelper i18nHelper) {
        try {
            if (SlideResourceType.BOARD.getValue().equals(card.getResourceType())) {
                return serviceFactory.boardService()
                        .getBoards(Collections.singletonList(card.getResourceUrl()))
                        .compose(boards -> {
                            if (boards.isEmpty()) {
                                return Future.succeededFuture();
                            }

                            try {
                                Board referencedBoard = boards.get(0);
                                JsonObject referencedSlideShow = createSlideShowObject(referencedBoard);

                                String imageUrl = referencedBoard.getImageUrl();
                                if (imageUrl == null || imageUrl.isEmpty()) {
                                    try {
                                        Slide slide = createSlideFromCard(card, slideFactory,
                                                documents, referencedSlideShow, i18nHelper);
                                        XSLFSlide newSlide = ppt.createSlide();
                                        slide.createApacheSlide(newSlide);
                                    } catch (Exception e) {
                                        String cardTitle = card != null ? card.getTitle() : "Carte inconnue";
                                        log.error(
                                                "Failed to process card: " + card.getId() + " with title: " + cardTitle,
                                                e);
                                        addCardWithError(cardTitle);
                                    }
                                    return Future.succeededFuture();
                                }

                                String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                                referencedSlideShow.put(Field.BOARD_IMAGE_ID, imageId);

                                boolean imageExists = documents.stream()
                                        .anyMatch(doc -> imageId.equals(doc.get(Field.DOCUMENTID)));

                                if (!imageExists) {
                                    return fetchDocumentFile(imageId, documents)
                                            .compose(v -> {
                                                try {
                                                    Slide slide = createSlideFromCard(card, slideFactory,
                                                            documents, referencedSlideShow, i18nHelper);
                                                    XSLFSlide newSlide = ppt.createSlide();
                                                    slide.createApacheSlide(newSlide);
                                                } catch (Exception e) {
                                                    String cardTitle = card != null ? card.getTitle()
                                                            : "Carte inconnue";
                                                    log.error("Failed to process card: " + card.getId()
                                                            + " with title: " + cardTitle, e);
                                                    addCardWithError(cardTitle);
                                                }
                                                return Future.succeededFuture();
                                            });
                                } else {
                                    try {
                                        Slide slide = createSlideFromCard(card, slideFactory,
                                                documents, referencedSlideShow, i18nHelper);
                                        XSLFSlide newSlide = ppt.createSlide();
                                        slide.createApacheSlide(newSlide);
                                    } catch (Exception e) {
                                        String cardTitle = card != null ? card.getTitle() : "Carte inconnue";
                                        log.error(
                                                "Failed to process card: " + card.getId() + " with title: " + cardTitle,
                                                e);
                                        addCardWithError(cardTitle);
                                    }
                                    return Future.succeededFuture();
                                }
                            } catch (Exception e) {
                                String cardTitle = card != null ? card.getTitle() : "Carte inconnue";
                                log.error("Failed to process referenced board card: " + card.getId() + " with title: "
                                        + cardTitle, e);
                                addCardWithError(cardTitle);
                                return Future.succeededFuture();
                            }
                        });
            } else {
                try {
                    Slide slide = createSlideFromCard(card, slideFactory, documents, null, i18nHelper);
                    XSLFSlide newSlide = ppt.createSlide();
                    slide.createApacheSlide(newSlide);
                } catch (Exception e) {
                    String cardTitle = card != null ? card.getTitle() : "Carte inconnue";
                    log.error("Failed to process card: " + card.getId() + " with title: " + cardTitle, e);
                    addCardWithError(cardTitle);
                }
                return Future.succeededFuture();
            }
        } catch (Exception e) {
            String cardTitle = card != null ? card.getTitle() : "Carte inconnue";
            log.error("Failed to process card: " + (card != null ? card.getId() : "unknown") + " with title: "
                    + cardTitle, e);
            addCardWithError(cardTitle);
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
            I18nHelper i18nHelper) throws IOException {
        SlideProperties.Builder propertiesBuilder = new SlideProperties.Builder()
                .title(board.getTitle())
                .description(board.getDescription());

        String imageUrl = board.getImageUrl();
        String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        byte[] document;
        Map<String, Object> documentData = documents.stream()
                .filter(doc -> imageId.equals(doc.get(Field.DOCUMENTID)))
                .findFirst()
                .orElse(null);
        String contentType;
        if (documentData == null) {
            ClassLoader classLoader = getClass().getClassLoader();
            InputStream inputStream = classLoader.getResourceAsStream(MAGNETO_SVG);

            if (inputStream != null) {
                document = IOUtils.toByteArray(inputStream);
                contentType = CONTENT_TYPE_IMAGE_SVG_XML;
            }
            else {
                log.error("Failed to load SVG file");
                document = new byte[0];
                contentType = "";
            }
        }
        else {
            Buffer buffer = (Buffer) documentData.get(Field.BUFFER);
            document = buffer.getBytes();
            contentType = (String) documentData.get(Field.CONTENTTYPE);
        }

        // Format the modification date to dd/MM/yyyy
        String formattedModificationDate = "";
        try {
            // Parse the original date string
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            // Format to the desired output
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd/MM/yyyy");

            Date parsedDate = inputFormat.parse(board.getModificationDate());
            formattedModificationDate = outputFormat.format(parsedDate);
        } catch (ParseException e) {
            formattedModificationDate = board.getModificationDate();
        }

        propertiesBuilder
                .ownerName(i18nHelper.translate("magneto.slideshow.created.by") + board.getOwnerName() + ",")
                .modificationDate(i18nHelper.translate("magneto.slideshow.updated.the") + formattedModificationDate)
                .resourceData(document)
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

    private final ThreadLocal<List<String>> cardsWithErrors = new ThreadLocal<>();

    // Méthode publique pour récupérer les cartes en erreur
    public List<String> getCardsWithErrors() {
        List<String> errors = cardsWithErrors.get();
        return errors != null ? errors : Collections.emptyList();
    }

    // Méthode privée pour réinitialiser les cartes en erreur
    private void resetCardsWithErrors() {
        cardsWithErrors.set(new ArrayList<>());
    }

    // Méthode privée pour ajouter une carte en erreur
    private void addCardWithError(String cardTitle) {
        List<String> errors = cardsWithErrors.get();
        if (errors == null) {
            errors = new ArrayList<>();
            cardsWithErrors.set(errors);
        }
        errors.add(cardTitle);
    }


    @Override
    public Future<Buffer> exportBoardToCSV(String boardId, UserInfos user) {
        Promise<Buffer> promise = Promise.promise();

        this.serviceFactory.boardService().getBoardWithContent(boardId, user, false, null)
                .onSuccess(board -> {
                    try {
                        List<Card> cards;
                        Map<String, String> cardToSectionTitle = new HashMap<>();

                        if (board.isLayoutFree()){
                            cards = board.cards();
                        } else {
                            cards = board.sections().stream()
                                    .flatMap(section -> {
                                        List<Card> sectionCards = section.getCards();
                                        sectionCards.forEach(card -> cardToSectionTitle.put(card.getId(), section.getTitle()));
                                        return sectionCards.stream();
                                    })
                                    .collect(Collectors.toList());
                        }

                        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

                        // Ajouter le BOM UTF-8 pour Excel
                        outputStream.write(0xEF);
                        outputStream.write(0xBB);
                        outputStream.write(0xBF);

                        CSVPrinter printer = new CSVPrinter(
                                new OutputStreamWriter(outputStream, StandardCharsets.UTF_8),
                                CSVFormat.EXCEL.builder()
                                        .setDelimiter(';')
                                        .build()
                        );

                        buildBoardCSV(board, cards, printer, cardToSectionTitle);

                        printer.flush();
                        printer.close();

                        promise.complete(Buffer.buffer(outputStream.toByteArray()));

                    } catch (IOException e) {
                        promise.fail(e);
                    }
                })
                .onFailure(promise::fail);

        return promise.future();
    }

    public void buildBoardCSV(Board board, List<Card> cards, CSVPrinter printer, Map<String, String> cardToSectionTitle) throws IOException {

        // Section 1 : Propriétés du tableau
        printer.printRecord("Propriétés du tableau", "", "", "", "", "", "", "", "", "", "", "", "");

        printer.printRecord(
                "Titre",
                "Image",
                "Description",
                "Disposition",
                "Positionnement des aimants",
                "Aimants figés ?",
                "Commentaires activés ?",
                "Favoris affichés ?",
                "Mots-clés",
                "Image d'arrière-plan",
                "Nombre d'aimants",
                "Date de création",
                "Date de modification"
        );

        printer.printRecord(
                board.getTitle(),
                board.getImageUrl() != null ? board.getImageUrl() : "",
                board.getDescription() != null ? board.getDescription() : "",
                board.getLayoutType(),
                board.getSortOrCreateBy().getValue(),
                board.isLocked() ? "oui" : "non",
                board.canComment() ? "oui" : "non",
                board.displayNbFavorites() ? "oui" : "non",
                board.tags() != null ? board.tags() : "",
                board.getBackgroundUrl() != null ? board.getBackgroundUrl() : "",
                String.valueOf(cards.size()),
                board.getCreationDate(),
                board.getModificationDate()
        );

        // Lignes vides de séparation
        printer.printRecord("", "", "", "", "", "", "", "", "", "", "", "", "");
        printer.printRecord("", "", "", "", "", "", "", "", "", "", "", "", "");
        printer.printRecord("", "", "", "", "", "", "", "", "", "", "", "", "");

        // Section 2 : Aimants (Cards)
        printer.printRecord("Aimants", "", "", "", "", "", "", "", "", "", "", "", "");

        printer.printRecord(
                "Titre",
                "Type",
                "URL de la ressource",
                "Légende",
                "Description",
                "Section",
                "Verrouillé ?",
                "Nombre de favoris",
                "Nombre de commentaires",
                "Créé par",
                "Date de création",
                "Modifié par",
                "Date de modification"
        );

        // Pour chaque card
        for (Card card : cards) {
            printer.printRecord(
                    card.getTitle(),
                    card.getResourceType(),
                    card.getResourceUrl() != null ? card.getResourceUrl() : "",
                    card.getCaption() != null ? card.getCaption() : "",
                    card.getDescription() != null ? card.getDescription() : "",
                    cardToSectionTitle.getOrDefault(card.getId(), ""),
                    card.isLocked() ? "oui" : "non",
                    String.valueOf(card.getNbOfFavorites()),
                    String.valueOf(card.getNbOfComments()),
                    card.getOwnerName(),
                    card.getCreationDate(),
                    card.getLastModifierName() != null ? card.getLastModifierName() : "",
                    card.getModificationDate() != null ? card.getModificationDate() : ""
            );
        }
    }
}