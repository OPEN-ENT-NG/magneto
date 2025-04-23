package fr.cgi.magneto.service;

import fr.cgi.magneto.model.FolderPayload;
import fr.cgi.magneto.model.share.SharedElem;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface FolderService {

        /**
        * Get user folders
        * @param user          User Object containing user id and displayed name
        * @param isDeleted     fetch deleted folders if true
        * @return              Future {@link Future <JsonObject>} containing list of folders
        */
        Future<JsonArray> getFolders(UserInfos user, boolean isDeleted);

        /**
        * Create a folder
        * @param folder        Folder to create
        * @return              Future {@link Future <JsonObject>} containing newly created folder
        */
        Future<JsonObject> createFolder(FolderPayload folder);

        /**
         * Update a folder
         * @param folder     Folder to update
         * @return           Future {@link Future <JsonObject>} containing updated folder
         */
        Future<JsonObject> updateFolder(FolderPayload folder);


        /**
         * Delete folders
         * @param user       User Object containing user id and displayed name
         * @param folderIds  Folders identifiers
         * @return           Future {@link Future <JsonObject>} containing deleted folders
         */
        Future<JsonObject> deleteFoldersAndBoards(UserInfos user, List<String> folderIds);


        /**
         * Predelete folders with their boards
         * @param user       User Object containing user id and displayed name
         * @param folderIds  Folders identifiers
         * @param restore    If true : restore from trash
         * @return           Future {@link Future <JsonObject>} containing predeleted folders
         */
        Future<JsonObject> preDeleteFoldersAndBoards(UserInfos user, List<String> folderIds, boolean restore);

        /**
         * Move boards to another folder
         * @param userId        User identifier
         * @param boardIds      Boards identifiers
         * @param folderId      Folder identifier
         * @return              Future {@link Future <JsonObject>} containing board
         */
        Future<JsonObject> moveBoardsToFolder(String userId, List<String> boardIds, String folderId);


        /**
         * Remove boardIds from corresponding folder
         * @param boardIds   Boards identifiers
         * @return           Future {@link Future <JsonObject>} containing folder
         */
        Future<JsonObject> updateOldFolder(List<String> boardIds);

        /**
         * Return folder parent of a boardId
         *
         * @param boardId
         * @return
         */
        Future<JsonObject> getFolderByBoardId(String boardId);

        /**
         * Get boards Ids in a folder ( even boards from others folders inside the asked folder)
         *
         * @param id
         * @return
         */
         Future<List<String>> getChildrenBoardsIds(String id);

        /**
         * Share folders with new rights and delete the rights to remove
         *
         * @param id
         * @param newShares new rights to apply
         * @param deletedShares rights to remove
         * @return
         */
        Future<Void> shareFolder(String id, List<SharedElem> newShares, List<SharedElem> deletedShares);

        Future<JsonArray> getFolders(List<String> folderChildrenIds);
}
