package fr.cgi.magneto.service;

import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.statistics.StatisticsPayload;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;


public interface CardService {

    /**
     * Create a Card
     *
     * @param card Card to create {@link CardPayload}
     * @param id   Generated identifier for new card
     * @return Future {@link Future <JsonObject>} containing newly created card
     */
    Future<JsonObject> create(CardPayload card, String id);

    /**
     * Add a card to a board (with locked items logic)
     *
     * @param updateCard          Card to insert {@link CardPayload}
     * @param updateBoardsFutures List of futures for the parent to resolve
     * @param currentBoard        Board where we are inserting a card
     * @param user                User Object containing user id and displayed name
     */
    void addCardWithLocked(CardPayload updateCard, List<Future> updateBoardsFutures, Board currentBoard, UserInfos user);

    void removeCardWithLocked(JsonObject moveCard, Future<List<Board>> getOldBoardFuture, List<Future> updateBoardsFutures, UserInfos user);

    /**
     * Add a card to a section (with locked items logic)
     *
     * @param updateCard          Card to insert {@link CardPayload}
     * @param updateBoardsFutures List of futures for the parent to resolve
     * @param currentBoard        Board where we are inserting a card
     * @param user                User Object containing user id and displayed name
     */
    void addCardSectionWithLocked(CardPayload updateCard, Future<List<Section>> getSectionFuture, List<Future> updateBoardsFutures,
                                  Board currentBoard, String defaultTitle, UserInfos user);

    void removeCardSectionWithLocked(CardPayload updateCard, String oldBoardId, Future<List<Section>> getOldSectionFuture, List<Future> updateBoardsFutures,
                                     Board currentBoard, UserInfos user);

    void deleteCardsWithLocked(List<String> cardIds, Future<List<Section>> getSectionFuture, Board currentBoard, List<Future> removeCardsFutures, UserInfos user);

    /**
     * Create a Card and adding it to section or not depending on layout
     *
     * @param card      Card to create {@link CardPayload}
     * @param i18n      I18nHelper Helper for I18n keys
     * @param userInfos User Object containing user id and displayed name
     * @return Future {@link Future <JsonObject>} containing newly created card
     */
    Future<JsonObject> createCardLayout(CardPayload card, I18nHelper i18n, UserInfos userInfos);

    /**
     * Update a card
     *
     * @param card Card to update
     * @return Future {@link Future <JsonObject>} containing updated card
     */
    Future<JsonObject> update(CardPayload card);

    /**
     * Delete cards
     * @param userId  User identifier
     * @param cardIds List of card identifiers
     * @return Future {@link Future <JsonObject>} containing list of deleted cards
     */
    Future<JsonObject> deleteCards(String userId, List<String> cardIds);
    Future<JsonObject> deleteCards(List<String> cardIds);

    /**
     * Get all cards
     *
     * @param user       User Object containing user id and displayed name
     * @param boardId
     * @param page       Page number
     * @param isPublic   fetch public boards if true
     * @param isShared   fetch shared boards if true
     * @param isFavorite fetch favorite board if true
     * @param searchText Search text
     * @param sortBy     Sort by parameter
     * @return Future {@link Future <JsonObject>} containing all cards created by the user
     */

    Future<JsonObject> getAllCards(UserInfos user, String boardId, Integer page, boolean isPublic, boolean isShared, boolean isFavorite, String searchText, String sortBy);

    /**
     * Get cards by ids
     *
     * @param cardIds Identifier list of the searching card
     * @param user  {@link UserInfos} User info
     * @return Future {@link Future <JsonArray>} containing the card list corresponding to the ids
     */
    Future<List<Card>> getCards(List<String> cardIds, UserInfos user);


    /**
     * Get all cards
     *
     * @param boardIds List of board identifiers
     * @return Future {@link Future <JsonObject>} containing list of deleted cards
     */
    Future<JsonObject> deleteCardsByBoards(List<String> boardIds);

    /**
     * Get all cards by board
     *
     * @param board Board object
     * @param page  Page number
     * @param user    {@link UserInfos} User info
     * @param fromStartPage if true the request will retrieve cards from the page 0 to @param page
     * @return Future {@link Future <JsonObject>} containing the cards corresponding to the board identifier
     */
    Future<JsonObject> getAllCardsByBoard(Board board, Integer page, UserInfos user, boolean fromStartPage);
    Future<List<Card>> getAllCardsByBoard(Board board, UserInfos user);
    Future<List<Card>> getAllCardsByBoard(Board board, UserInfos user, UserInfos userToFetch);

    /**
     * Get all cards by creation date
     *
     * @param statisticsPayload Statistics filter object
     * @return Future {@link Future List<Card>} containing the cards corresponding to the creation date
     */
    Future<List<Card>> getAllCardsByCreationDate(StatisticsPayload statisticsPayload);

    /**
     * Get all cards by section
     *
     * @param section Section object
     * @param page    Page number
     * @param user    {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing the cards corresponding to the board identifier
     */
    Future<JsonObject> getAllCardsBySection(Section section, Integer page, UserInfos user);

    /**
     * Duplicate cards
     *
     * @param boardId Board identifiers
     * @param cards   List of card to duplicate
     * @param section Section where cards are duplicate
     * @param user    {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing status of duplicate
     */
    Future<JsonObject> duplicateCards(String boardId, List<Card> cards, SectionPayload section, UserInfos user);

    /**
     * Update board
     *
     * @param boardPayload Boards to update
     * @return Future {@link Future <JsonObject>} containing status of update
     */
    Future<JsonObject> updateBoard(BoardPayload boardPayload);

    /**
     * Update the list of favorite for a card, adding or deleting the a user from it
     *
     * @param cardId   The id of the card we want to update
     * @param favorite The new favorite status
     * @param user     {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing the id of the updated card
     */
    Future<JsonObject> updateFavorite(String cardId, boolean favorite, UserInfos user);

    /**
     * Duplicate a section (mainly its cards)
     *
     * @param boardId     The id of the card we want to update
     * @param cardsFilter The new favorite status
     * @param user        {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing the id of the updated card
     */
    Future<JsonObject> duplicateSection(String boardId, List<Card> cardsFilter, SectionPayload setId, UserInfos user);
}
