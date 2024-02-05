package fr.cgi.magneto.service;

import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.share.SharedElem;
import fr.cgi.magneto.model.statistics.StatisticsPayload;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;


public interface BoardService {

    /**
     * Create a Board
     *
     * @param user           User Object containing user id and displayed name
     * @param board          JsonObjet Board to create
     * @param defaultSection Boolean Create a seciton by default or no
     * @param i18n           I18nHelper Containing I18n keys
     * @return Future {@link Future <JsonObject>} containing newly created board
     */
    Future<JsonObject> create(UserInfos user, JsonObject board, boolean defaultSection, I18nHelper i18n);

    /**
     * Update a board
     *
     * @param board Board to update
     * @return Future {@link Future <JsonObject>} containing updated board
     */
    Future<JsonObject> update(BoardPayload board);

    /**
     * Update layout cards configuration in board
     *
     * @param updateBoard  {@link BoardPayload} Board to update
     * @param currentBoard {@link Board} Board infos
     * @param i18n         I18nHelper Helper for I18n keys
     * @param user    {@link UserInfos} User info
     * @return Future {@link Future <JsonObject>} containing updated board
     */
    Future<JsonObject> updateLayoutCards(BoardPayload updateBoard, Board currentBoard, I18nHelper i18n, UserInfos user);

    /**
     * Duplicate a board
     *
     * @param boardId Board identifier to duplicate
     * @param user    User who duplicate
     * @param i18n    I18nHelper Helper for I18n keys
     * @return Future {@link Future <JsonObject>} containing duplicated board
     */

    Future<JsonObject> duplicate(String boardId, UserInfos user, I18nHelper i18n);


    /**
     * Get boards by id
     *
     * @param boardIds Board ids to get data
     * @return Future {@link Future <JsonObject>} containing a list of board
     */
    Future<List<Board>> getBoards(List<String> boardIds);


    /**
     * Get all boards
     *
     * @param user       User Object containing user id and displayed name
     * @param page       Page number
     * @param searchText Search text
     * @param folderId   Folder identifier
     * @param isPublic   fetch public boards if true
     * @param isShared   fetch shared boards if true
     * @param isDeleted  fetch deleted boards if true
     * @param sortBy     Sort by parameter
     * @param allFolders fetch all folders if true
     * @return Future {@link Future <JsonObject>} containing list of boards
     */
    Future<JsonObject> getAllBoards(UserInfos user, Integer page, String searchText, String folderId,
                                    boolean isPublic, boolean isShared, boolean isDeleted, String sortBy, boolean allFolders);

    /**
     * Get all boards with publish right
     *
     * @param user {@link UserInfos} User info
     * @return Future {@link Future <List<Board>} containing list of editable boards
     */
    Future<List<Board>> getAllBoardsEditable(UserInfos user);

    /**
     * Get all boards by creation date
     *
     * @param statisticsPayload Statistics filter object
     * @return Future {@link Future List<Board>} containing the boards corresponding to the creation date
     */
    Future<List<Board>> getAllBoardsByCreationDate(StatisticsPayload statisticsPayload);

    /**
     * Get all document ids of a user from a board
     * @param boardId Board identifier
     * @param user User who get documents
     * @return Future {@link Future <List<String>>} containing list of document ids
     */
    Future<List<String>> getAllDocumentIds(String boardId, UserInfos user);

    /**
     * Pre delete boards
     *
     * @param userId   User identifier
     * @param boardIds List of board identifiers
     * @param restore  If true : restore from trash
     * @return Future {@link Future <JsonObject>} containing list of predeleted boards
     */
    Future<JsonObject> preDeleteBoards(String userId, List<String> boardIds, boolean restore);

    /**
     * Delete boards
     *
     * @param userId   User identifier
     * @param boardIds List of board identifiers
     * @return Future {@link Future <JsonObject>} containing list of deleted boards
     */
    Future<JsonObject> delete(String userId, List<String> boardIds);

    /**
     * share Boards
     *
     * @param ids
     * @param share
     * @param checkOldRights
     * @return
     */
    Future<List<String> > shareBoard(List<String> ids, JsonObject share, boolean checkOldRights);

    /**
     * share Boards
     *
     * @param boardsIds
     * @param share
     * @param deletedShared
     * @param checkOldRights
     * @return
     */
    Future<List<String>> shareBoard(List<String> boardsIds, List<SharedElem> share, List<SharedElem> deletedShared,boolean checkOldRights );

    Future<List<String>> getOwnedBoardsIds(List<String> boardsIds,String userId );
}
