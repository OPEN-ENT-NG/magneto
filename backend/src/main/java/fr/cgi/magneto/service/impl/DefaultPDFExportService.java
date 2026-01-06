package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.FileFormatConstants;
import fr.cgi.magneto.helper.LogHelper;
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
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.entcore.common.pdf.Pdf;
import org.entcore.common.pdf.PdfFactory;
import org.entcore.common.pdf.PdfGenerator;
import org.entcore.common.user.UserInfos;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static fr.cgi.magneto.core.constants.ConfigFields.NODE_PDF_GENERATOR;
import static fr.cgi.magneto.core.constants.FileFormatConstants.getFileFormat;

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
                    String message = String.format("Failed to export PDF for card %s : %s", card.getId(), err.getMessage());
                    LogHelper.logError(this, "exportSingleCard", message, err.getMessage());
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
                    String message = String.format("Failed to export PDF : %s", err.getMessage());
                    LogHelper.logError(this, "exportSelectedCards", message, err.getMessage());
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> exportMultipleCards(String boardId, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        this.serviceFactory.boardService().getBoardWithContent(boardId, user, false, null)
                .onFailure(err -> {
                    String message = String.format("Failed to get board %s : %s", boardId, err.getMessage());
                    LogHelper.logError(this, "exportMultipleCards", message, err.getMessage());
                })
                .compose(board -> buildMultiCardData(board, user))
                .compose(templateData -> generatePDF(request, templateData, CollectionsConstant.TEMPLATE_BOARD_MULTI_CARDS))
                .onSuccess(buffer -> promise.complete(new JsonObject().put(Field.TITLE, CollectionsConstant.FILE_PREFIX_BOARD + sanitizeFilename(boardId)).put(Field.BUFFER, buffer)))
                .onFailure(err -> {
                    String message = String.format("Failed to export PDF for board %s : %s", boardId, err.getMessage());
                    LogHelper.logError(this, "exportMultipleCards", message, err.getMessage());
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
        data.put("boardIsOwner", board.getOwnerId() != null && board.getOwnerId().equals(user.getUserId()));
        data.put(Field.IS_LAYOUT_FREE, board.isLayoutFree());

        addIcons(data);

        List<Card> allCards = getAllCardsFromBoard(board);

        serviceFactory.boardService().getAllDocumentIds(board.getId(), user)
                .compose(documentIds -> {
                    String imageUrl = board.getImageUrl();
                    String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                    documentIds.add(imageId);

                    findReferencedDocumentIdsInCards(documentIds, allCards);

                    return serviceFactory.exportService().getBoardDocuments(documentIds);
                })
                .onFailure(err -> {
                    String message = String.format("Failed to get document IDs for board %s : %s", board.getId(), err.getMessage());
                    LogHelper.logError(this, "buildMultiCardData", message, err.getMessage());
                    promise.fail(err.getMessage());
                })
                .onSuccess(docs -> {
                    documents.addAll(docs);

                    String imageId = board.getImageUrl().substring(board.getImageUrl().lastIndexOf('/') + 1);
                    String imageBase64 = serviceFactory.imageService().getDocumentAsBase64(imageId, documents);
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

                                            if (!board.isLayoutFree() && currentSectionId != null && !currentSectionId.equals(previousSectionId)) {
                                                Section section = findSectionById(board, currentSectionId);
                                                if (section != null) {
                                                    cardData.put(Field.SECTION_TITLE, section.getTitle());
                                                    cardData.put(Field.SECTION_COLOR, section.getColor());
                                                    cardData.put(Field.SHOW_SECTION, true);
                                                }
                                            }
                                        })
                                        .onFailure(err -> {
                                            String message = String.format("Failed to build card data for card %s : %s", card.getId(), err.getMessage());
                                            LogHelper.logError(this, "buildMultiCardData", message, err.getMessage());
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
                                String message = String.format("Failed to build all cards data for board %s : %s", board.getId(), err.getMessage());
                                LogHelper.logError(this, "buildMultiCardData", message, err.getMessage());
                                promise.fail(err.getMessage());
                            });
                });

        return promise.future();
    }

    private void findReferencedDocumentIdsInCards(List<String> documentIds, List<Card> allCards) {
        allCards.stream()
                .map(Card::getDescription)
                .filter(Objects::nonNull)
                .filter(desc -> !desc.isEmpty())
                .flatMap(desc -> extractDocumentIdsFromHtml(desc).stream())
                .filter(id -> !documentIds.contains(id))
                .forEach(documentIds::add);
    }

    /**
     * Construit les données d'une carte pour un export PNG individuel
     */
    private Future<JsonObject> buildCardDataForSingleExport(Card card, UserInfos user, List<Map<String, Object>> documents) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject cardData = new JsonObject();

        cardData.put(Field.TITLE, card.getTitle());
        cardData.put(Field.OWNERNAME, card.getOwnerName());
        cardData.put(Field.LASTMODIFIERNAME, card.getLastModifierName());
        cardData.put(Field.HAS_EDITOR, hasEditor(card));
        cardData.put(Field.MODIFICATIONDATE, formatDate(card.getModificationDate()));
        cardData.put(Field.RESOURCETYPE, card.getResourceType());
        cardData.put(Field.CAPTION, card.getCaption());
        cardData.put(Field.RESOURCEURL, card.getResourceUrl() != null ? card.getResourceUrl() : "");

        addResourceTypeFlags(cardData, card);
        addIcons(cardData);

        boolean isBoardResource = Field.RESOURCE_BOARD.equals(card.getResourceType());
        cardData.put(Field.IS_BOARD_RESOURCE, isBoardResource);

        if (CollectionsConstant.RESOURCE_TYPE_IMAGE.equals(card.getResourceType()) && card.getResourceId() != null) {
            String imageBase64 = serviceFactory.imageService().getDocumentAsBase64(card.getResourceId(), documents);
            cardData.put(Field.IMG_SRC, imageBase64);
        }

        // Traiter la description pour convertir les images en base64
        String sanitizedDescription = sanitizeHtml(card.getDescription());
        serviceFactory.imageService().processHtmlImages(sanitizedDescription, documents)
                .compose(processedDescription -> {
                    cardData.put(Field.DESCRIPTION, processedDescription);

                    return getCardDate(card, user, documents, isBoardResource, cardData);
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String message = String.format("Failed to build card data for card %s : %s", card.getId(), err.getMessage());
                    LogHelper.logError(this, "buildCardDataForSingleExport", message, err.getMessage());
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    private Future<JsonObject> getCardDate(Card card, UserInfos user, List<Map<String, Object>> documents, boolean isBoardResource, JsonObject cardData) {
        if (isBoardResource && card.getResourceUrl() != null) {
            return serviceFactory.boardService().getBoards(Collections.singletonList(card.getResourceUrl()))
                    .map(boards -> {
                        if (boards != null && !boards.isEmpty()) {
                            Board referencedBoard = boards.get(0);
                            if (referencedBoard != null)
                                addBoardInfos(cardData, referencedBoard, user, documents);
                        }
                        return cardData;
                    });
        } else {
            return Future.succeededFuture(cardData);
        }
    }

    /**
     * Construit une map associant chaque carte à l'ID de sa section
     */
    private Map<String, String> buildCardToSectionMap(Board board) {
        if (board.isLayoutFree()) {
            return Collections.emptyMap();
        }

        return board.sections().stream()
                .filter(Section::getDisplayed)
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
        cardData.put(Field.RESOURCEURL, card.getResourceUrl() != null ? card.getResourceUrl() : "");
        if (card.getCaption() != null && !card.getCaption().trim().isEmpty())
            cardData.put(Field.CAPTION, card.getCaption());

        addResourceTypeFlags(cardData, card);

        boolean isBoardResource = Field.RESOURCE_BOARD.equals(card.getResourceType());
        cardData.put(Field.IS_BOARD_RESOURCE, isBoardResource);

        if (CollectionsConstant.RESOURCE_TYPE_IMAGE.equals(card.getResourceType()) && card.getResourceId() != null) {
            String imageBase64 = serviceFactory.imageService().getDocumentAsBase64(card.getResourceId(), documents);
            cardData.put(Field.IMG_SRC, imageBase64);
        }

        // Traiter la description pour convertir les images en base64
        String sanitizedDescription = sanitizeHtml(card.getDescription());
        serviceFactory.imageService().processHtmlImages(sanitizedDescription, documents)
                .compose(processedDescription -> {
                    cardData.put(Field.DESCRIPTION, processedDescription);

                    if (isBoardResource && card.getResourceUrl() != null) {
                        return serviceFactory.boardService().getBoards(Collections.singletonList(card.getResourceUrl()))
                                .map(boards -> {
                                    if (boards != null && !boards.isEmpty()) {
                                        Board referencedBoard = boards.get(0);
                                        if (referencedBoard != null)
                                            addBoardInfos(cardData, referencedBoard, user, documents);
                                    }
                                    return cardData;
                                });
                    } else {
                        return Future.succeededFuture(cardData);
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String message = String.format("Failed to build card data for card %s", card.getId());
                    LogHelper.logError(this, "buildCardDataForMultiExport", message, err.getMessage());
                    promise.fail(err.getMessage());
                });

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
        cardData.put(Field.BOARD_OWNER_NAME, board.getOwnerName());
        cardData.put(Field.BOARD_NB_CARDS, board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections());
        cardData.put(Field.BOARD_IS_PUBLIC, board.isPublic());
        cardData.put(Field.BOARD_MODIFICATION_DATE, formatDate(board.getModificationDate()));
        cardData.put(Field.BOARD_IS_SHARED, board.getShared() != null && !board.getShared().isEmpty());

        String imageId = board.getImageUrl().substring(board.getImageUrl().lastIndexOf('/') + 1);
        String imageBase64 = serviceFactory.imageService().getDocumentAsBase64(imageId, documents);
        cardData.put(Field.IMG_SRC, imageBase64);
    }

    private void addIcons(JsonObject data) {
        data.put(Field.ICON_CROWN, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_CROWN));
        data.put(Field.ICON_USER, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_USER));
        data.put(Field.ICON_MAGNET, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_MAGNET));
        data.put(Field.ICON_PUBLIC, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_PUBLIC));
        data.put(Field.ICON_CALENDAR, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_CALENDAR_BLANK));
        data.put(Field.ICON_SHARE, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_SHARE_VARIANT));

        data.put(Field.ICON_VIDEO, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_VIDEO));
        data.put(Field.ICON_AUDIO, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_AUDIO));
        data.put(Field.ICON_LINK, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_LINK));
        data.put(Field.ICON_FILE, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_FILE));
        data.put(Field.ICON_TEXT, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_TEXT));
        data.put(Field.ICON_IMAGE, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_IMAGE));
        data.put(Field.ICON_SHEET, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_SHEET));
        data.put(Field.ICON_PDF, serviceFactory.imageService().loadSvgAsBase64(CollectionsConstant.SVG_PDF));
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

        if (CollectionsConstant.RESOURCE_TYPE_FILE.equals(resourceType)) {
            String fileFormat = getFileFormat(card.getMetadata().getExtension());

            cardData.put(Field.IS_TEXT_FORMAT, FileFormatConstants.FORMAT_TEXT.equals(fileFormat));
            cardData.put(Field.IS_IMAGE_FORMAT, FileFormatConstants.FORMAT_IMAGE.equals(fileFormat));
            cardData.put(Field.IS_VIDEO_FORMAT, FileFormatConstants.FORMAT_VIDEO.equals(fileFormat));
            cardData.put(Field.IS_AUDIO_FORMAT, FileFormatConstants.FORMAT_AUDIO.equals(fileFormat));
            cardData.put(Field.IS_SHEET_FORMAT, FileFormatConstants.FORMAT_SHEET.equals(fileFormat));
            cardData.put(Field.IS_PDF_FORMAT, FileFormatConstants.FORMAT_PDF.equals(fileFormat));
            cardData.put(Field.IS_DEFAULT_FORMAT, FileFormatConstants.FORMAT_DEFAULT.equals(fileFormat));
        }
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
                    .filter(Section::getDisplayed)
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
                    String message = String.format("Failed: %s", ar.cause().getMessage());
                    LogHelper.logError(this, "generatePDFFromTemplate", message, ar.cause().getMessage());
                    promise.fail(ar.cause().getMessage());
                } else {
                    promise.complete(ar.result());
                }
            });
        } catch (Exception e) {
            String message = String.format("Exception: %s", e.getMessage());
            LogHelper.logError(this, "generatePDFFromTemplate", message, e.getMessage());
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
                String message = String.format("Failed to read template file: %s", templateName);
                LogHelper.logError(this, "generatePDF", message, result.cause().getMessage());
                promise.fail(message);
                return;
            }

            StringReader reader = new StringReader(result.result().toString(StandardCharsets.UTF_8));
            renders.processTemplate(request, templateProps, templateName, reader, writer -> {
                String processedTemplate = ((StringWriter) writer).getBuffer().toString();
                if (processedTemplate.isEmpty()) {
                    String message = String.format("Failed to process template: %s", templateName);
                    LogHelper.logError(this, "generatePDF", message, templateName);
                    promise.fail(message);
                    return;
                }

                String pdfTitle = templateProps.getString(Field.TITLE, CollectionsConstant.DEFAULT_EXPORT_FILENAME);
                generatePDFFromTemplate(pdfTitle, processedTemplate)
                        .onSuccess(res -> promise.complete(res.getContent()))
                        .onFailure(error -> {
                            String message = String.format("Failed to generate PDF: %s", error.getMessage());
                            LogHelper.logError(this, "generatePDF", message, error.getMessage());
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
                String message = String.format("Failed to upload PDF: %s", uploadEvt.getString(Field.MESSAGE));
                LogHelper.logError(this, "uploadPdfAndSetFileId", message, uploadEvt.getString(Field.MESSAGE));
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

    @Override
    public Future<JsonObject> exportCardsAsPngArchive(String boardId, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        this.serviceFactory.boardService().getBoardWithContent(boardId, user, false, null)
                .onFailure(err -> {
                    String message = String.format("Failed to get board %s : %s", boardId, err.getMessage());
                    LogHelper.logError(this, "exportCardsAsPngArchive", message, err.getMessage());
                    promise.fail(err.getMessage());
                })
                .compose(board -> {
                    List<Card> allCards = getAllCardsFromBoard(board);

                    return serviceFactory.boardService().getAllDocumentIds(board.getId(), user)
                            .compose(documentIds -> {
                                String imageUrl = board.getImageUrl();
                                String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                                documentIds.add(imageId);

                                findReferencedDocumentIdsInCards(documentIds, allCards);
                                return serviceFactory.exportService().getBoardDocuments(documentIds);
                            })
                            .compose(documents -> generatePngArchiveForCards(allCards, board, user, request, documents));
                })
                .onSuccess(zipBuffer -> {
                    String filename = CollectionsConstant.FILE_PREFIX_BOARD + sanitizeFilename(boardId) + ".zip";
                    JsonObject result = new JsonObject()
                            .put(Field.TITLE, filename)
                            .put(Field.BUFFER, zipBuffer);
                    promise.complete(result);
                })
                .onFailure(err -> {
                    String message = String.format("Failed to export PNG archive : %s", err.getMessage());
                    LogHelper.logError(this, "exportCardsAsPngArchive", message, err.getMessage());
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    /**
     * Génère une archive ZIP contenant les PNG de toutes les cartes
     */
    /**
     * Génère une archive ZIP contenant les PNG de toutes les cartes
     */
    private Future<Buffer> generatePngArchiveForCards(List<Card> cards, Board board, UserInfos user,
                                                      HttpServerRequest request, List<Map<String, Object>> documents) {
        Promise<Buffer> promise = Promise.promise();

        Map<String, String> cardToSectionMap = buildCardToSectionMap(board);

        // Générer un PDF pour chaque carte
        List<Future<PngFile>> pngFutures = IntStream.range(0, cards.size())
                .mapToObj(index -> {
                    Card card = cards.get(index);
                    String currentSectionId = cardToSectionMap.get(card.getId());
                    Section section = currentSectionId != null ? findSectionById(board, currentSectionId) : null;
                    String sectionPrefix = section != null ? sanitizeFilename(section.getTitle()) + "_" : "";

                    return buildCardDataForSingleExport(card, user, documents)
                            .compose(cardData -> {
                                // Ajouter les icônes nécessaires
                                addIcons(cardData);
                                return generatePDF(request, cardData, CollectionsConstant.TEMPLATE_CARD_READ_VIEW);
                            })
                            .compose(pdfBuffer -> convertPdfToPng(pdfBuffer))
                            .map(pngBytes -> {
                                String filename =  String.format("%03d", index + 1) + "_" + sectionPrefix + "_" +
                                        sanitizeFilename(card.getTitle()) + ".png";
                                return new PngFile(filename, pngBytes);
                            })
                            .onFailure(err -> {
                                String message = String.format("Failed to process card %s : %s", card.getId(), err.getMessage());
                                LogHelper.logError(this, "generatePngArchiveForCards", message, err.getMessage());
                            });
                })
                .collect(Collectors.toList());

        Future.all(pngFutures)
                .onSuccess(futures -> {
                    try {
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        ZipOutputStream zos = new ZipOutputStream(baos);

                        for (int i = 0; i < futures.size(); i++) {
                            PngFile pngFile = futures.resultAt(i);
                            ZipEntry zipEntry = new ZipEntry(pngFile.filename);
                            zos.putNextEntry(zipEntry);
                            zos.write(pngFile.data);
                            zos.closeEntry();
                        }

                        zos.close();
                        promise.complete(Buffer.buffer(baos.toByteArray()));
                    } catch (IOException e) {
                        String message = String.format("Failed to create ZIP : %s", e.getMessage());
                        LogHelper.logError(this, "generatePngArchiveForCards", message, e.getMessage());
                        promise.fail(e.getMessage());
                    }
                })
                .onFailure(err -> {
                    String message = String.format("Failed to generate PNGs : %s", err.getMessage());
                    LogHelper.logError(this, "generatePngArchiveForCards", message, err.getMessage());
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    /**
     * Convertit un PDF en PNG (première page uniquement)
     */
    private Future<byte[]> convertPdfToPng(Buffer pdfBuffer) {
        Promise<byte[]> promise = Promise.promise();

        serviceFactory.vertx().executeBlocking(blockingPromise -> {
            try (PDDocument document = PDDocument.load(new ByteArrayInputStream(pdfBuffer.getBytes()))) {
                PDFRenderer renderer = new PDFRenderer(document);

                // Convertir la première page en image haute résolution (300 DPI)
                BufferedImage image = renderer.renderImageWithDPI(0, 300, ImageType.RGB);

                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                ImageIO.write(image, "png", baos);

                blockingPromise.complete(baos.toByteArray());
            } catch (Exception e) {
                String message = String.format("Failed to convert PDF to PNG : %s", e.getMessage());
                LogHelper.logError(this, "convertPdfToPng", message, e.getMessage());
                blockingPromise.fail(e);
            }
        }, false, res -> {
            if (res.succeeded()) {
                promise.complete((byte[]) res.result());
            } else {
                promise.fail(res.cause());
            }
        });

        return promise.future();
    }

    /**
     * Classe interne pour stocker un fichier PNG
     */
    private static class PngFile {
        final String filename;
        final byte[] data;

        PngFile(String filename, byte[] data) {
            this.filename = filename;
            this.data = data;
        }
    }

    /**
     * Extrait tous les IDs de documents (images) présents dans le HTML
     */
    private List<String> extractDocumentIdsFromHtml(String htmlContent) {
        List<String> documentIds = new ArrayList<>();
        if (htmlContent == null || htmlContent.isEmpty()) {
            return documentIds;
        }

        // Pattern pour trouver les URLs du workspace dans les balises img
        Pattern workspacePattern = Pattern.compile("/workspace/document/([a-f0-9\\-]+)", Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = workspacePattern.matcher(htmlContent);

        while (matcher.find()) {
            String documentId = matcher.group(1);
            // Enlever les query params si présents
            if (documentId.contains("?")) {
                documentId = documentId.substring(0, documentId.indexOf("?"));
            }
            if (!documentIds.contains(documentId)) {
                documentIds.add(documentId);
            }
        }

        log.debug(String.format("[Magneto@%s::extractDocumentIdsFromHtml] Found %d document IDs in HTML",
                this.getClass().getSimpleName(), documentIds.size()));

        return documentIds;
    }

    private String sanitizeHtml(String html) {
        if (html == null) return null;

        PolicyFactory policy = Sanitizers.FORMATTING
                .and(Sanitizers.BLOCKS)
                .and(Sanitizers.IMAGES)
                .and(Sanitizers.LINKS);

        return policy.sanitize(html);
    }
}