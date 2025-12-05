package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.service.PDFExportService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.webutils.data.FileResolver;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.apache.commons.io.IOUtils;
import org.entcore.common.pdf.Pdf;
import org.entcore.common.pdf.PdfFactory;
import org.entcore.common.pdf.PdfGenerator;
import org.entcore.common.user.UserInfos;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import static fr.cgi.magneto.core.constants.ConfigFields.NODE_PDF_GENERATOR;

/**
 * Export PDF des cartes en mode lecture (Read View)
 * Supporte l'export d'une carte unique ou de plusieurs cartes
 */
public class DefaultPDFExportService implements PDFExportService {
    private static final Logger log = LoggerFactory.getLogger(DefaultPDFExportService.class);

    private final ServiceFactory serviceFactory;
    private final Renders renders;
    private final PdfFactory pdfFactory;

    public DefaultPDFExportService(ServiceFactory serviceFactory) {
        this.serviceFactory = serviceFactory;
        this.renders = new Renders(serviceFactory.vertx(), serviceFactory.config());
        this.pdfFactory = new PdfFactory(serviceFactory.vertx(), new JsonObject().put(NODE_PDF_GENERATOR, serviceFactory.config().getJsonObject(NODE_PDF_GENERATOR, new JsonObject())));
    }

    public static String loadSvgAsBase64(String iconName) {
        try (InputStream is = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(CollectionsConstant.IMG_RESOURCES_PATH + iconName + CollectionsConstant.SVG_EXTENSION)) {
            if (is == null) {
                return "";
            }
            byte[] bytes = IOUtils.toByteArray(is);
            String base64 = Base64.getEncoder().encodeToString(bytes);
            return CollectionsConstant.DATA_IMAGE_SVG_BASE64 + base64;
        } catch (IOException e) {
            log.error("[Magneto@DefaultPDFExportService::loadSvgAsBase64] Failed to load SVG icon: " + iconName, e);
            return "";
        }
    }

    @Override
    public Future<JsonObject> exportSingleCard(Card card, Board referencedBoard, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildSingleCardData(card, referencedBoard, user);
        String filename = CollectionsConstant.FILE_PREFIX_CARD + sanitizeFilename(card.getTitle()) + CollectionsConstant.FILE_EXTENSION_PDF;

        generatePDF(request, templateData, CollectionsConstant.TEMPLATE_CARD_READ_VIEW)
                .compose(buffer -> {
                    JsonObject pdfInfos = new JsonObject().put(Field.TITLE, filename);
                    return uploadPdfAndSetFileId(pdfInfos, buffer);
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportSingleCard] Failed to export PDF for card %s : %s",
                            this.getClass().getSimpleName(), card.getId(), err.getMessage());
                    log.error(message);
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> exportSelectedCards(List<Card> cards, String documentTitle, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildSelectedCardsData(cards, documentTitle, user);
        String filename = sanitizeFilename(documentTitle) + CollectionsConstant.FILE_EXTENSION_PDF;

        generatePDF(request, templateData, CollectionsConstant.TEMPLATE_BOARD_MULTI_CARDS)
                .compose(buffer -> {
                    JsonObject pdfInfos = new JsonObject().put(Field.TITLE, filename);
                    return uploadPdfAndSetFileId(pdfInfos, buffer);
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportSelectedCards] Failed to export PDF : %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> exportMultipleCards(String boardId, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        this.serviceFactory.boardService().getBoardWithContent(boardId, user, false, null)
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportMultipleCards] Failed to get board %s : %s",
                            this.getClass().getSimpleName(), boardId, err.getMessage());
                    log.error(message);
                })
                .compose(board -> buildMultiCardData(board, user))
                .compose(templateData -> generatePDF(request, templateData, CollectionsConstant.TEMPLATE_BOARD_MULTI_CARDS))
                .onSuccess(buffer -> promise.complete(new JsonObject().put(Field.TITLE, CollectionsConstant.FILE_PREFIX_BOARD + sanitizeFilename(boardId)).put(Field.BUFFER, buffer)))
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::exportMultipleCards] Failed to export PDF for board %s : %s",
                            this.getClass().getSimpleName(), boardId, err.getMessage());
                    log.error(message);
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    /**
     * Construit les données pour l'export de plusieurs cartes d'un board
     */
    private Future<JsonObject> buildMultiCardData(Board board, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        List<Map<String, Object>> documents = new ArrayList<>();
        JsonObject data = new JsonObject();
        data.put(Field.TITLE, board.getTitle());
        data.put(Field.DESCRIPTION, board.getDescription());
        data.put(Field.OWNERNAME, board.getOwnerName());
        data.put(Field.MODIFICATIONDATE, formatDate(board.getModificationDate()));
        data.put(Field.ISPUBLIC, board.isPublic());
        data.put(Field.ISSHARED, board.getShared() != null && !board.getShared().isEmpty());
        data.put(Field.NBCARDS, board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections());

        addIcons(data);

        List<Card> allCards = getAllCardsFromBoard(board);

        serviceFactory.boardService().getAllDocumentIds(board.getId(), user)
                .compose(documentIds -> {
                    String imageUrl = board.getImageUrl();
                    String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                    documentIds.add(imageId);
                    return serviceFactory.exportService().getBoardDocuments(documentIds);
                })
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::buildMultiCardData] Failed to get document IDs for board %s : %s",
                            this.getClass().getSimpleName(), board.getId(), err.getMessage());
                    log.error(message);
                    promise.fail(err.getMessage());
                })
                .onSuccess(docs -> {
                    documents.addAll(docs);

                    String imageId = board.getImageUrl().substring(board.getImageUrl().lastIndexOf('/') + 1);
                    String imageBase64 = getDocumentAsBase64(imageId, documents);
                    data.put(Field.BOARD_IMG_SRC, imageBase64);

                    Map<String, String> cardToSectionMap = buildCardToSectionMap(board);

                    List<Future<JsonObject>> cardFutures = IntStream.range(0, allCards.size())
                            .mapToObj(index -> {
                                Card card = allCards.get(index);
                                String currentSectionId = cardToSectionMap.get(card.getId());
                                String previousSectionId = index > 0 ? cardToSectionMap.get(allCards.get(index - 1).getId()) : null;

                                return buildCardDataForMultiExport(card, user, documents)
                                        .onSuccess(cardData -> {
                                            cardData.put(Field.IS_LAST_CARD, index == allCards.size() - 1);

                                            if (!board.isLayoutFree() && currentSectionId != null) {
                                                Section section = findSectionById(board, currentSectionId);
                                                if (section != null) {
                                                    cardData.put(Field.SECTION_TITLE, section.getTitle());

                                                    boolean showSectionPage = index == 0 || !currentSectionId.equals(previousSectionId);
                                                    cardData.put(Field.SHOW_SECTION_PAGE, showSectionPage);
                                                }
                                            }
                                        })
                                        .onFailure(err -> {
                                            String message = String.format("[Magneto@%s::buildMultiCardData] Failed to build card data for card %s : %s",
                                                    this.getClass().getSimpleName(), card.getId(), err.getMessage());
                                            log.error(message);
                                        });
                            })
                            .collect(Collectors.toList());

                    Future.all(cardFutures)
                            .onSuccess(futures -> {
                                JsonArray cardsArray = new JsonArray();
                                for (int i = 0; i < futures.size(); i++) {
                                    cardsArray.add(futures.resultAt(i));
                                }
                                data.put(Field.CARDS, cardsArray);
                                promise.complete(data);
                            })
                            .onFailure(err -> {
                                String message = String.format("[Magneto@%s::buildMultiCardData] Failed to build all cards data for board %s : %s",
                                        this.getClass().getSimpleName(), board.getId(), err.getMessage());
                                log.error(message);
                                promise.fail(err.getMessage());
                            });
                });

        return promise.future();
    }

    /**
     * Construit une map associant chaque carte à l'ID de sa section
     */
    private Map<String, String> buildCardToSectionMap(Board board) {
        if (board.isLayoutFree()) {
            return Collections.emptyMap();
        }

        return board.sections().stream()
                .flatMap(section -> section.getCardIds().stream()
                        .map(cardId -> new AbstractMap.SimpleEntry<>(cardId, section.getId())))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    /**
     * Trouve une section par son ID
     */
    private Section findSectionById(Board board, String sectionId) {
        return board.sections().stream()
                .filter(section -> sectionId.equals(section.getId()))
                .findFirst()
                .orElse(null);
    }

    /**
     * Construit les données pour l'export d'une sélection de cartes
     */
    private JsonObject buildSelectedCardsData(List<Card> cards, String documentTitle, UserInfos user) {
        JsonObject data = new JsonObject();
        data.put(Field.TITLE, documentTitle);

        JsonArray cardsArray = new JsonArray();
        for (int i = 0; i < cards.size(); i++) {
            Card card = cards.get(i);
            JsonObject cardData = new JsonObject();
            cardData.put(Field.IS_LAST_CARD, i == cards.size() - 1);
            cardsArray.add(cardData);
        }

        data.put(Field.CARDS, cardsArray);
        return data;
    }

    /**
     * Construit les données d'une carte pour un export multi-cartes
     */
    private Future<JsonObject> buildCardDataForMultiExport(Card card, UserInfos user, List<Map<String, Object>> documents) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject cardData = new JsonObject();

        cardData.put(Field.TITLE, card.getTitle());
        cardData.put(Field.OWNERNAME, card.getOwnerName());
        cardData.put(Field.LASTMODIFIERNAME, card.getLastModifierName());
        cardData.put(Field.HAS_EDITOR, hasEditor(card));
        cardData.put(Field.MODIFICATIONDATE, formatDate(card.getModificationDate()));
        cardData.put(Field.RESOURCETYPE, card.getResourceType());
        cardData.put(Field.CAPTION, card.getCaption());
        cardData.put(Field.DESCRIPTION, card.getDescription());
        cardData.put(Field.RESOURCEURL, card.getResourceUrl() != null ? card.getResourceUrl() : "");

        addResourceTypeFlags(cardData, card);

        boolean isBoardResource = Field.RESOURCE_BOARD.equals(card.getResourceType());
        cardData.put(Field.IS_BOARD_RESOURCE, isBoardResource);

        if (CollectionsConstant.RESOURCE_TYPE_IMAGE.equals(card.getResourceType()) && card.getResourceId() != null) {
            String imageBase64 = getDocumentAsBase64(card.getResourceId(), documents);
            cardData.put(Field.IMG_SRC, imageBase64);
        }

        if (isBoardResource && card.getResourceUrl() != null) {
            serviceFactory.boardService().getBoards(Collections.singletonList(card.getResourceUrl()))
                    .onSuccess(boards -> {
                        if (boards != null && !boards.isEmpty()) {
                            Board referencedBoard = boards.get(0);
                            if (referencedBoard != null)
                                addBoardInfos(cardData, referencedBoard, user, documents);

                        }
                        promise.complete(cardData);
                    })
                    .onFailure(err -> {
                        String message = String.format("[Magneto@%s::buildCardDataForMultiExport] Failed to get boards for card %s : %s",
                                this.getClass().getSimpleName(), card.getId(), err.getMessage());
                        log.error(message);
                        promise.fail(err.getMessage());
                    });

        } else {
            promise.complete(cardData);
        }

        return promise.future();
    }

    /**
     * Construit les données pour l'export d'une carte unique
     */
    private JsonObject buildSingleCardData(Card card, Board referencedBoard, UserInfos user) {
        JsonObject cardData = new JsonObject();

        cardData.put(Field.TITLE, card.getTitle());
        cardData.put(Field.OWNERNAME, card.getOwnerName());
        cardData.put(Field.LASTMODIFIERNAME, card.getLastModifierName());
        cardData.put(Field.HAS_EDITOR, hasEditor(card));
        cardData.put(Field.MODIFICATIONDATE, formatDate(card.getModificationDate()));
        cardData.put(Field.RESOURCETYPE, card.getResourceType());
        cardData.put(Field.CAPTION, card.getCaption());
        cardData.put(Field.DESCRIPTION, card.getDescription());

        boolean isBoardResource = Field.RESOURCE_BOARD.equals(card.getResourceType());
        cardData.put(Field.IS_BOARD_RESOURCE, isBoardResource);

        if (isBoardResource && referencedBoard != null) {
            addBoardInfos(cardData, referencedBoard, user, null);
        }

        return cardData;
    }

    /**
     * Ajoute les informations du board aux données de la carte
     */
    private void addBoardInfos(JsonObject cardData, Board board, UserInfos user, List<Map<String, Object>> documents) {
        cardData.put(Field.BOARD_IS_OWNER, board.getOwnerId() != null && board.getOwnerId().equals(user.getUserId()));
        cardData.put(Field.BOARD_OWNER_NAME, board.getOwnerName());
        cardData.put(Field.BOARD_NB_CARDS, board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections());
        cardData.put(Field.BOARD_IS_PUBLIC, board.isPublic());
        cardData.put(Field.BOARD_MODIFICATION_DATE, formatDate(board.getModificationDate()));
        cardData.put(Field.BOARD_IS_SHARED, board.getShared() != null && !board.getShared().isEmpty());

        String imageId = board.getImageUrl().substring(board.getImageUrl().lastIndexOf('/') + 1);
        String imageBase64 = getDocumentAsBase64(imageId, documents);
        cardData.put(Field.IMG_SRC, imageBase64);
    }

    private void addIcons(JsonObject data) {
        data.put(Field.ICON_CROWN, loadSvgAsBase64(CollectionsConstant.SVG_CROWN));
        data.put(Field.ICON_USER, loadSvgAsBase64(CollectionsConstant.SVG_USER));
        data.put(Field.ICON_MAGNET, loadSvgAsBase64(CollectionsConstant.SVG_MAGNET));
        data.put(Field.ICON_PUBLIC, loadSvgAsBase64(CollectionsConstant.SVG_PUBLIC));
        data.put(Field.ICON_CALENDAR, loadSvgAsBase64(CollectionsConstant.SVG_CALENDAR_BLANK));
        data.put(Field.ICON_SHARE, loadSvgAsBase64(CollectionsConstant.SVG_SHARE_VARIANT));

        data.put(Field.ICON_VIDEO, loadSvgAsBase64(CollectionsConstant.SVG_VIDEO));
        data.put(Field.ICON_AUDIO, loadSvgAsBase64(CollectionsConstant.SVG_AUDIO));
        data.put(Field.ICON_LINK, loadSvgAsBase64(CollectionsConstant.SVG_LINK));
        data.put(Field.ICON_FILE, loadSvgAsBase64(CollectionsConstant.SVG_FILE));
        data.put(Field.ICON_BOARD, loadSvgAsBase64(CollectionsConstant.SVG_BOARD_ICON));
    }

    private void addResourceTypeFlags(JsonObject cardData, Card card) {
        String resourceType = card.getResourceType();
        cardData.put(Field.IS_TEXT_RESOURCE, CollectionsConstant.RESOURCE_TYPE_TEXT.equals(resourceType));
        cardData.put(Field.IS_IMAGE_RESOURCE, CollectionsConstant.RESOURCE_TYPE_IMAGE.equals(resourceType));
        cardData.put(Field.IS_VIDEO_RESOURCE, CollectionsConstant.RESOURCE_TYPE_VIDEO.equals(resourceType));
        cardData.put(Field.IS_AUDIO_RESOURCE, CollectionsConstant.RESOURCE_TYPE_AUDIO.equals(resourceType));
        cardData.put(Field.IS_LINK_RESOURCE, CollectionsConstant.RESOURCE_TYPE_LINK.equals(resourceType));
        cardData.put(Field.IS_FILE_RESOURCE, CollectionsConstant.RESOURCE_TYPE_FILE.equals(resourceType));
        cardData.put(Field.IS_BOARD_RESOURCE, Field.RESOURCE_BOARD.equals(resourceType));
    }

    /**
     * Trouve la section contenant une carte donnée
     */
    private Section findSectionForCard(Board board, String cardId) {
        for (Section section : board.sections()) {
            if (section.getCardIds() != null && section.getCardIds().contains(cardId)) {
                return section;
            }
        }
        return null;
    }

    /**
     * Vérifie si une carte a été modifiée par quelqu'un d'autre que son créateur
     */
    private boolean hasEditor(Card card) {
        String lastModifierName = card.getLastModifierName();
        String ownerName = card.getOwnerName();
        return lastModifierName != null &&
                !lastModifierName.isEmpty() &&
                !lastModifierName.equals(ownerName);
    }

    /**
     * Formate une date au format "DD MMMM YYYY"
     */
    private String formatDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return "";
        }
        try {
            SimpleDateFormat inputFormat = new SimpleDateFormat(CollectionsConstant.DATE_FORMAT_INPUT);
            SimpleDateFormat outputFormat = new SimpleDateFormat(CollectionsConstant.DATE_FORMAT_OUTPUT, Locale.FRENCH);
            Date date = inputFormat.parse(dateString);
            return outputFormat.format(date);
        } catch (Exception e) {
            log.warn("[Magneto@DefaultPDFExportService::formatDate] Failed to format date: " + dateString, e);
            return dateString;
        }
    }

    /**
     * Nettoie un nom de fichier pour éviter les caractères invalides
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return CollectionsConstant.DEFAULT_EXPORT_FILENAME;
        }
        return filename.replaceAll(CollectionsConstant.FILENAME_REGEX, CollectionsConstant.FILENAME_REPLACEMENT);
    }

    /**
     * Récupère toutes les cartes d'un board (gère les boards libres et à sections)
     */
    private List<Card> getAllCardsFromBoard(Board board) {
        if (board.isLayoutFree()) {
            return board.cards();
        } else {
            return board.sections().stream()
                    .flatMap(section -> section.getCards().stream())
                    .collect(Collectors.toList());
        }
    }

    /**
     * Génère le PDF à partir du template traité
     */
    private Future<Pdf> generatePDFFromTemplate(String filename, String buffer) {
        Promise<Pdf> promise = Promise.promise();
        try {
            PdfGenerator pdfGenerator = pdfFactory.getPdfGenerator();
            pdfGenerator.generatePdfFromTemplate(filename, buffer, ar -> {
                if (ar.failed()) {
                    log.error(String.format("[Magneto@%s::generatePDFFromTemplate] Failed: %s",
                            this.getClass().getSimpleName(), ar.cause().getMessage()));
                    promise.fail(ar.cause().getMessage());
                } else {
                    promise.complete(ar.result());
                }
            });
        } catch (Exception e) {
            log.error(String.format("[Magneto@%s::generatePDFFromTemplate] Exception: %s",
                    this.getClass().getSimpleName(), e.getMessage()));
            promise.fail(e.getMessage());
        }
        return promise.future();
    }

    /**
     * Génère le PDF à partir d'un template Mustache
     */
    private Future<Buffer> generatePDF(HttpServerRequest request, JsonObject templateProps, String templateName) {
        Promise<Buffer> promise = Promise.promise();
        final String baseUrl = getScheme(request) + "://" + Renders.getHost(request) + serviceFactory.config().getString(CollectionsConstant.APP_ADDRESS) + CollectionsConstant.PUBLIC_PATH;
        final String path = FileResolver.absolutePath(CollectionsConstant.TEMPLATE_PATH + templateName);

        serviceFactory.vertx().fileSystem().readFile(path, result -> {
            if (!result.succeeded()) {
                String message = String.format("[Magneto@%s::generatePDF] Failed to read template file: %s",
                        this.getClass().getSimpleName(), templateName);
                log.error(message, result.cause());
                promise.fail(message);
                return;
            }

            StringReader reader = new StringReader(result.result().toString(StandardCharsets.UTF_8));
            renders.processTemplate(request, templateProps, templateName, reader, writer -> {
                String processedTemplate = ((StringWriter) writer).getBuffer().toString();
                if (processedTemplate.isEmpty()) {
                    String message = String.format("[Magneto@%s::generatePDF] Failed to process template: %s",
                            this.getClass().getSimpleName(), templateName);
                    log.error(message);
                    promise.fail(message);
                    return;
                }

                String pdfTitle = templateProps.getString(Field.TITLE, CollectionsConstant.DEFAULT_EXPORT_FILENAME);
                generatePDFFromTemplate(pdfTitle, processedTemplate)
                        .onSuccess(res -> promise.complete(res.getContent()))
                        .onFailure(error -> {
                            String message = String.format("[Magneto@%s::generatePDF] Failed to generate PDF: %s",
                                    this.getClass().getSimpleName(), error.getMessage());
                            log.error(message, error);
                            promise.fail(error.getMessage());
                        });
            });
        });

        return promise.future();
    }

    /**
     * Upload le PDF généré dans le storage et retourne les informations du fichier
     */
    private Future<JsonObject> uploadPdfAndSetFileId(JsonObject pdfInfos, Buffer buffer) {
        Promise<JsonObject> promise = Promise.promise();
        serviceFactory.storage().writeBuffer(buffer, CollectionsConstant.APPLICATION_PDF, pdfInfos.getString(Field.TITLE), uploadEvt -> {
            if (!Field.OK.equals(uploadEvt.getString(Field.STATUS))) {
                String message = String.format("[Magneto@%s::uploadPdfAndSetFileId] Failed to upload PDF: %s",
                        this.getClass().getSimpleName(), uploadEvt.getString(Field.MESSAGE));
                log.error(message);
                promise.fail(uploadEvt.getString(Field.MESSAGE));
                return;
            }
            pdfInfos.put(Field.FILE_ID, uploadEvt.getString(Field._ID));
            promise.complete(pdfInfos);
        });
        return promise.future();
    }

    /**
     * Récupère le schéma HTTP/HTTPS de la requête
     */
    private String getScheme(HttpServerRequest request) {
        String scheme = request.scheme();
        if (scheme == null) {
            scheme = serviceFactory.config().getString(CollectionsConstant.SCHEME, Field.HTTP);
        }
        return scheme;
    }

    /**
     * Récupère un document et le convertit en base64 avec son content-type
     */
    private String getDocumentAsBase64(String documentId, List<Map<String, Object>> documents) {
        if (documentId == null || documents == null) {
            return "";
        }

        for (Map<String, Object> doc : documents) {
            if (documentId.equals(doc.get(Field.DOCUMENT_ID))) {
                Buffer buffer = (Buffer) doc.get(Field.BUFFER);
                String contentType = (String) doc.get(Field.CONTENTTYPE);

                if (buffer != null) {
                    String base64 = Base64.getEncoder().encodeToString(buffer.getBytes());
                    return CollectionsConstant.DATA_PREFIX + (contentType != null ? contentType : CollectionsConstant.DEFAULT_CONTENT_TYPE) + CollectionsConstant.BASE64_SUFFIX + base64;
                }
            }
        }

        return "";
    }
}