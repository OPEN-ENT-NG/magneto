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
import org.entcore.common.pdf.Pdf;
import org.entcore.common.pdf.PdfGenerator;
import org.entcore.common.user.UserInfos;

import java.io.StringReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import static fr.cgi.magneto.core.constants.Field.TITLE;

/**
 * Export PDF des cartes en mode lecture (Read View)
 * Supporte l'export d'une carte unique ou de plusieurs cartes
 */
public class DefaultPDFExportService implements PDFExportService {
    private static final Logger log = LoggerFactory.getLogger(DefaultPDFExportService.class);

    private final ServiceFactory serviceFactory;

    public DefaultPDFExportService(ServiceFactory serviceFactory) {
        this.serviceFactory = serviceFactory;
    }

    @Override
    public Future<JsonObject> exportSingleCard(Card card, Board referencedBoard, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildSingleCardData(card, referencedBoard);
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
    public Future<JsonObject> exportMultipleCards(String boardId, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildMultiCardData(board);
        String filename = "Board_" + sanitizeFilename(board.getTitle()) + ".pdf";

        generatePDF(request, templateData, "board-multi-cards-export-template.xhtml")
                .compose(buffer -> {
                    JsonObject pdfInfos = new JsonObject().put(TITLE, filename);
                    return uploadPdfAndSetFileId(pdfInfos, buffer);
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    String errMessage = String.format("[Magneto@DefaultPDFExportService::exportMultipleCards] Failed to export PDF for board %s : %s",
                            boardId, err.getMessage());
                    log.error(errMessage);
                    promise.fail(err.getMessage());
                });

        return promise.future();
    }

    @Override
    public Future<JsonObject> exportSelectedCards(List<Card> cards, String documentTitle, UserInfos user, HttpServerRequest request) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject templateData = buildSelectedCardsData(cards, documentTitle);
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

    /**
     * Construit les données pour l'export d'une carte unique
     */
    private JsonObject buildSingleCardData(Card card, Board referencedBoard) {
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
            addBoardInfos(cardData, referencedBoard);
        }

        return cardData;
    }

    /**
     * Construit les données pour l'export de plusieurs cartes d'un board
     */
    private JsonObject buildMultiCardData(Board board) {
        JsonObject data = new JsonObject();
        data.put(TITLE, board.getTitle());

        JsonArray cardsArray = new JsonArray();
        List<Card> allCards = getAllCardsFromBoard(board);

        for (int i = 0; i < allCards.size(); i++) {
            Card card = allCards.get(i);
            JsonObject cardData = buildCardDataForMultiExport(card);
            cardData.put("isLastCard", i == allCards.size() - 1);

            // Ajouter le titre de section si board à sections
            if (!board.isLayoutFree()) {
                Section section = findSectionForCard(board, card.getId());
                if (section != null) {
                    cardData.put("sectionTitle", section.getTitle());
                }
            }

            cardsArray.add(cardData);
        }

        data.put("cards", cardsArray);
        return data;
    }

    /**
     * Construit les données pour l'export d'une sélection de cartes
     */
    private JsonObject buildSelectedCardsData(List<Card> cards, String documentTitle) {
        JsonObject data = new JsonObject();
        data.put(TITLE, documentTitle);

        JsonArray cardsArray = new JsonArray();
        for (int i = 0; i < cards.size(); i++) {
            Card card = cards.get(i);
            JsonObject cardData = buildCardDataForMultiExport(card);
            cardData.put("isLastCard", i == cards.size() - 1);
            cardsArray.add(cardData);
        }

        data.put("cards", cardsArray);
        return data;
    }

    /**
     * Construit les données d'une carte pour un export multi-cartes
     */
    private JsonObject buildCardDataForMultiExport(Card card) {
        JsonObject cardData = new JsonObject();

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

        if (isBoardResource && card.getResourceUrl() != null) {
            // TODO: Récupérer le board référencé via un service
            // Board referencedBoard = boardService.getById(card.getResourceUrl());
            // if (referencedBoard != null) {
            //     addBoardInfos(cardData, referencedBoard);
            // }
        }

        return cardData;
    }

    /**
     * Ajoute les informations du board aux données de la carte
     */
    private void addBoardInfos(JsonObject cardData, Board board) {
        cardData.put("boardIsOwner", board.getOwnerId() != null && board.getOwnerId().equals(currentUserId));
        cardData.put("boardOwnerName", board.getOwnerName());
        cardData.put("boardNbCards", board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections());
        cardData.put("boardIsPublic", board.isPublic());
        cardData.put("boardModificationDate", formatDate(board.getModificationDate()));
        cardData.put("boardIsShared", board.getShared() != null && !board.getShared().isEmpty());
    }

    /**
     * Récupère toutes les cartes d'un board (gère les boards libres et à sections)
     */
    private List<Card> getAllCardsFromBoard(Board board) {
        if (board.isLayoutFree()) {
            return board.cards();
        } else {
            List<Card> allCards = new ArrayList<>();
            for (Section section : board.sections()) {
                if (section.getCards() != null) {
                    allCards.addAll(section.getCards());
                }
            }
            return allCards;
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
     * Génère le PDF à partir d'un template Mustache
     */
    private Future<Buffer> generatePDF(HttpServerRequest request, JsonObject templateProps, String templateName) {
        Promise<Buffer> promise = Promise.promise();
        final String templatePath = "./public/template/pdf/";
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

                node = (String) vertx.sharedData().getLocalMap("server").get("node");
                if (node == null) {
                    node = "";
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
     * Upload le PDF généré dans le storage et retourne les informations du fichier
     */
    private Future<JsonObject> uploadPdfAndSetFileId(JsonObject pdfInfos, Buffer buffer) {
        Promise<JsonObject> promise = Promise.promise();
        storage.writeBuffer(buffer, "application/pdf", pdfInfos.getString(TITLE), uploadEvt -> {
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
            scheme = config.getString("scheme", "http");
        }
        return scheme;
    }
}