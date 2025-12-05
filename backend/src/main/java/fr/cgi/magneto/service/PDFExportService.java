package fr.cgi.magneto.service;

import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface PDFExportService {

    /**
     * Export a single card to PDF
     *
     * @param card The card to export
     * @param referencedBoard The referenced board (if card is of type "board"), can be null
     * @param user User infos
     * @return Future {@link Future<JsonObject>} containing PDF metadata (title, fileId)
     */
    Future<JsonObject> exportSingleCard(Card card, Board referencedBoard, UserInfos user, HttpServerRequest request);

    /**
     * Export all cards from a board to PDF (one page per card)
     *
     * @param board The board containing the cards to export
     * @param user User infos
     * @return Future {@link Future<JsonObject>} containing PDF metadata (title, fileId)
     */
    Future<JsonObject> exportMultipleCards(String boardId, UserInfos user, HttpServerRequest request);

    /**
     * Export a selection of cards to PDF (one page per card)
     *
     * @param cards List of cards to export
     * @param documentTitle Title of the PDF document
     * @param user User infos
     * @return Future {@link Future<JsonObject>} containing PDF metadata (title, fileId)
     */
    Future<JsonObject> exportSelectedCards(List<Card> cards, String documentTitle, UserInfos user, HttpServerRequest request);
}