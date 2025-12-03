package fr.cgi.magneto.service.impl;

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
import static fr.cgi.magneto.core.constants.Field.BUFFER;
import static fr.cgi.magneto.core.constants.Field.TITLE;

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
                .getResourceAsStream("./img/" + iconName + ".svg")) {
            if (is == null) {
                return "";
            }
            byte[] bytes = IOUtils.toByteArray(is);
            String base64 = Base64.getEncoder().encodeToString(bytes);
            return "data:image/svg+xml;base64," + base64;
        } catch (IOException e) {
            return "";
        }
    }

    @Override
    public Future<JsonObject> exportSingleCard(Card card, Board referencedBoard, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildSingleCardData(card, referencedBoard, user);
        String filename = "Card_" + sanitizeFilename(card.getTitle()) + ".pdf";

        generatePDF(request, templateData, "card-read-view-template.xhtml")
                .compose(buffer -> {
                    JsonObject pdfInfos = new JsonObject().put(TITLE, filename);
                    return uploadPdfAndSetFileId(pdfInfos, buffer);
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String errMessage = String.format("[Magneto@DefaultPDFExportService::exportSingleCard] Failed to export PDF for card %s : %s",
                            card.getId(), err.getMessage());
                    log.error(errMessage);
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> exportSelectedCards(List<Card> cards, String documentTitle, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildSelectedCardsData(cards, documentTitle, user);
        String filename = sanitizeFilename(documentTitle) + ".pdf";

        generatePDF(request, templateData, "board-multi-cards-export-template.xhtml")
                .compose(buffer -> {
                    JsonObject pdfInfos = new JsonObject().put(TITLE, filename);
                    return uploadPdfAndSetFileId(pdfInfos, buffer);
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String errMessage = String.format("[Magneto@DefaultPDFExportService::exportSelectedCards] Failed to export PDF : %s", err.getMessage());
                    log.error(errMessage);
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> exportMultipleCards(String boardId, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        this.serviceFactory.boardService().getBoardWithContent(boardId, user, false, null)
                .compose(board -> buildMultiCardData(board, user))
                .compose(templateData -> generatePDF(request, templateData, "board-multi-cards-export-template.xhtml"))
                .onSuccess(buffer -> promise.complete(new JsonObject().put(TITLE, "Board_" + sanitizeFilename(boardId)).put(BUFFER, buffer)))
                .onFailure(err -> {
                    String errMessage = String.format("[Magneto@DefaultPDFExportService::exportMultipleCards] Failed to export PDF for board %s : %s",
                            boardId, err.getMessage());
                    log.error(errMessage);
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
        data.put(TITLE, board.getTitle());
        data.put("description", board.getDescription());
        data.put("ownerName", board.getOwnerName());
        data.put("modificationDate", formatDate(board.getModificationDate()));
        data.put("isPublic", board.isPublic());
        data.put("isShared", board.getShared() != null && !board.getShared().isEmpty());
        data.put("nbCards", board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections());

        addIcons(data);

        List<Card> allCards = getAllCardsFromBoard(board);

        return serviceFactory.boardService().getAllDocumentIds(board.getId(), user)
                .compose(documentIds -> {
                    String imageUrl = board.getImageUrl();
                    String imageId = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
                    documentIds.add(imageId);
                    return serviceFactory.exportService().getBoardDocuments(documentIds);
                })
                .compose(docs -> {
                    documents.addAll(docs);

                    // Ajouter l'image du board pour la page de garde
                    String imageId = board.getImageUrl().substring(board.getImageUrl().lastIndexOf('/') + 1);
                    String imageBase64 = getDocumentAsBase64(imageId, documents);
                    data.put("boardImgSrc", imageBase64);

                    // Créer un map pour retrouver rapidement l'ID de section d'une carte
                    Map<String, String> cardToSectionMap = buildCardToSectionMap(board);

                    // Créer une liste de futures pour toutes les cartes
                    List<Future<JsonObject>> cardFutures = IntStream.range(0, allCards.size())
                            .mapToObj(index -> {
                                Card card = allCards.get(index);
                                String currentSectionId = cardToSectionMap.get(card.getId());
                                String previousSectionId = index > 0 ? cardToSectionMap.get(allCards.get(index - 1).getId()) : null;

                                return buildCardDataForMultiExport(card, user, documents)
                                        .compose(cardData -> {
                                            cardData.put("isLastCard", index == allCards.size() - 1);

                                            if (!board.isLayoutFree() && currentSectionId != null) {
                                                Section section = findSectionById(board, currentSectionId);
                                                if (section != null) {
                                                    cardData.put("sectionTitle", section.getTitle());

                                                    // Afficher une page de section si c'est la première carte ou s'il y a un changement de section
                                                    boolean showSectionPage = index == 0 || !currentSectionId.equals(previousSectionId);
                                                    cardData.put("showSectionPage", showSectionPage);
                                                }
                                            }

                                            return Future.succeededFuture(cardData);
                                        });
                            })
                            .collect(Collectors.toList());

                    // Attendre que toutes les futures se terminent
                    Future.all(cardFutures)
                            .onSuccess(futures -> {
                                JsonArray cardsArray = new JsonArray();
                                for (int i = 0; i < futures.size(); i++) {
                                    cardsArray.add(futures.resultAt(i));
                                }
                                data.put("cards", cardsArray);
                                promise.complete(data);
                            })
                            .onFailure(promise::fail);

                    return promise.future();
                });
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
        data.put(TITLE, documentTitle);

        JsonArray cardsArray = new JsonArray();
        for (int i = 0; i < cards.size(); i++) {
            Card card = cards.get(i);
            JsonObject cardData = new JsonObject();//buildCardDataForMultiExport(card, user);
            cardData.put("isLastCard", i == cards.size() - 1);
            cardsArray.add(cardData);
        }

        data.put("cards", cardsArray);
        return data;
    }

    /**
     * Construit les données d'une carte pour un export multi-cartes
     */
    private Future<JsonObject> buildCardDataForMultiExport(Card card, UserInfos user, List<Map<String, Object>> documents) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject cardData = new JsonObject();

        cardData.put(TITLE, card.getTitle());
        cardData.put("ownerName", card.getOwnerName());
        cardData.put("lastModifierName", card.getLastModifierName());
        cardData.put("hasEditor", hasEditor(card));
        cardData.put("modificationDate", formatDate(card.getModificationDate()));
        cardData.put("resourceType", card.getResourceType());
        cardData.put("caption", card.getCaption());
        cardData.put("description", card.getDescription());
        cardData.put("resourceUrl", card.getResourceUrl() != null ? card.getResourceUrl() : "");

        addResourceTypeFlags(cardData, card);

        // Si c'est une carte de type "board", ajouter les infos du board
        boolean isBoardResource = "board".equals(card.getResourceType());
        cardData.put("isBoardResource", isBoardResource);

        if ("image".equals(card.getResourceType()) && card.getResourceId() != null) {
            String imageBase64 = getDocumentAsBase64(card.getResourceId(), documents);
            cardData.put("imgSrc", imageBase64);
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
                        String errMessage = String.format("[Magneto@DefaultPDFExportService::buildCardDataForMultiExport] Failed to build PDF data for board %s : %s",
                                card.getBoardId(), err.getMessage());
                        log.error(errMessage);
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

        // Champs de base de la carte
        cardData.put(TITLE, card.getTitle());
        cardData.put("ownerName", card.getOwnerName());
        cardData.put("lastModifierName", card.getLastModifierName());
        cardData.put("hasEditor", hasEditor(card));
        cardData.put("modificationDate", formatDate(card.getModificationDate()));
        cardData.put("resourceType", card.getResourceType());
        cardData.put("caption", card.getCaption());
        cardData.put("description", card.getDescription());

        // Si c'est une carte de type "board", ajouter les infos du board
        boolean isBoardResource = "board".equals(card.getResourceType());
        cardData.put("isBoardResource", isBoardResource);

        if (isBoardResource && referencedBoard != null) {
            addBoardInfos(cardData, referencedBoard, user, null);
        }

        return cardData;
    }

    /**
     * Ajoute les informations du board aux données de la carte
     */
    private void addBoardInfos(JsonObject cardData, Board board, UserInfos user, List<Map<String, Object>> documents) {
        cardData.put("boardIsOwner", board.getOwnerId() != null && board.getOwnerId().equals(user.getUserId()));
        cardData.put("boardOwnerName", board.getOwnerName());
        cardData.put("boardNbCards", board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections());
        cardData.put("boardIsPublic", board.isPublic());
        cardData.put("boardModificationDate", formatDate(board.getModificationDate()));
        cardData.put("boardIsShared", board.getShared() != null && !board.getShared().isEmpty());

        String imageId = board.getImageUrl().substring(board.getImageUrl().lastIndexOf('/') + 1);
        String imageBase64 = getDocumentAsBase64(imageId, documents);
        cardData.put("imgSrc", imageBase64);
    }

    private void addIcons(JsonObject data) {
        data.put("iconCrown", loadSvgAsBase64("crown"));
        data.put("iconUser", loadSvgAsBase64("user"));
        data.put("iconMagnet", loadSvgAsBase64("magnet"));
        data.put("iconPublic", loadSvgAsBase64("public"));
        data.put("iconCalendar", loadSvgAsBase64("calendar-blank"));
        data.put("iconShare", loadSvgAsBase64("share-variant"));

        data.put("iconVideo", loadSvgAsBase64("extension/video"));
        data.put("iconAudio", loadSvgAsBase64("extension/audio"));
        data.put("iconLink", loadSvgAsBase64("extension/link"));
        data.put("iconFile", loadSvgAsBase64("extension/file"));
        data.put("iconBoard", loadSvgAsBase64("board"));
    }

    private void addResourceTypeFlags(JsonObject cardData, Card card) {
        String resourceType = card.getResourceType();
        cardData.put("isTextResource", "text".equals(resourceType));
        cardData.put("isImageResource", "image".equals(resourceType));
        cardData.put("isVideoResource", "video".equals(resourceType));
        cardData.put("isAudioResource", "audio".equals(resourceType));
        cardData.put("isLinkResource", "link".equals(resourceType));
        cardData.put("isFileResource", "file".equals(resourceType));
        cardData.put("isBoardResource", "board".equals(resourceType));
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
            SimpleDateFormat inputFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            SimpleDateFormat outputFormat = new SimpleDateFormat("dd MMMM yyyy", Locale.FRENCH);
            Date date = inputFormat.parse(dateString);
            return outputFormat.format(date);
        } catch (Exception e) {
            log.warn("[Magneto@DefaultPDFExportService::formatDate] Failed to format date: " + dateString);
            return dateString;
        }
    }

    /**
     * Nettoie un nom de fichier pour éviter les caractères invalides
     */
    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "export";
        }
        return filename.replaceAll("[^a-zA-Z0-9_\\-]", "_");
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
                    log.error("[Magneto@DefaultPDFExportService::generatePDFFromTemplate] Failed: " + ar.cause().getMessage());
                    promise.fail(ar.cause().getMessage());
                } else {
                    promise.complete(ar.result());
                }
            });
        } catch (Exception e) {
            log.error("[Magneto@DefaultPDFExportService::generatePDFFromTemplate] Exception: " + e.getMessage());
            promise.fail(e.getMessage());
        }
        return promise.future();
    }

    /**
     * Génère le PDF à partir d'un template Mustache
     */
    private Future<Buffer> generatePDF(HttpServerRequest request, JsonObject templateProps, String templateName) {
        Promise<Buffer> promise = Promise.promise();
        final String templatePath = "./template/export/";
        final String baseUrl = getScheme(request) + "://" + Renders.getHost(request) + serviceFactory.config().getString("app-address") + "/public/";
        final String path = FileResolver.absolutePath(templatePath + templateName);

        serviceFactory.vertx().fileSystem().readFile(path, result -> {
            if (!result.succeeded()) {
                String message = "[Magneto@DefaultPDFExportService::generatePDF] Failed to read template file: " + templateName;
                log.error(message);
                promise.fail(message);
                return;
            }

            StringReader reader = new StringReader(result.result().toString(StandardCharsets.UTF_8));
            renders.processTemplate(request, templateProps, templateName, reader, writer -> {
                String processedTemplate = ((StringWriter) writer).getBuffer().toString();
                if (processedTemplate.isEmpty()) {
                    String message = "[Magneto@DefaultPDFExportService::generatePDF] Failed to process template: " + templateName;
                    log.error(message);
                    promise.fail(message);
                    return;
                }

                String pdfTitle = templateProps.getString(TITLE, "export");
                generatePDFFromTemplate(pdfTitle, processedTemplate)
                        .onSuccess(res -> promise.complete(res.getContent()))
                        .onFailure(error -> {
                            String message = "[Magneto@DefaultPDFExportService::generatePDF] Failed to generate PDF: " + error.getMessage();
                            log.error(message);
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
        serviceFactory.storage().writeBuffer(buffer, "application/pdf", pdfInfos.getString(TITLE), uploadEvt -> {
            if (!"ok".equals(uploadEvt.getString("status"))) {
                String errorMessage = "[Magneto@DefaultPDFExportService::uploadPdfAndSetFileId] Failed to upload PDF: " + uploadEvt.getString("message");
                log.error(errorMessage);
                promise.fail(uploadEvt.getString("message"));
                return;
            }
            pdfInfos.put("fileId", uploadEvt.getString("_id"));
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
            scheme = serviceFactory.config().getString("scheme", "http");
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
            if (documentId.equals(doc.get("documentId"))) {
                Buffer buffer = (Buffer) doc.get("buffer");
                String contentType = (String) doc.get("contentType");

                if (buffer != null) {
                    String base64 = Base64.getEncoder().encodeToString(buffer.getBytes());
                    return "data:" + (contentType != null ? contentType : "image/jpeg") + ";base64," + base64;
                }
            }
        }

        return "";
    }
}