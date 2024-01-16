package fr.cgi.magneto.service;

import fr.cgi.magneto.model.share.SharedElem;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface ShareService {

    /**
     * Update or insert a shared array of rights in the element
     *
     * @param id
     * @param share
     * @param collection
     * @param checkOldRights
     * @return
     */
    Future<JsonObject> upsertSharedArray(String id, JsonObject share, String collection, boolean checkOldRights);

    /**
     * Update or insert a shared array of rights in the element
     *
     * @param id
     * @param newShare
     * @param deletedShares
     * @param collection
     * @param checkOldRights
     * @return
     */
    Future<JsonObject> upsertSharedArray(String id, List<SharedElem> newShare, List<SharedElem> deletedShares, String collection, boolean checkOldRights);

    /**
     * Return a list of SharedElem wich were present in the object and are not update in new Share
     *
     * @param oldShared old rights of the object
     * @param newShare  new rights to apply
     * @return list of SharedElem for old rights to keep
     */
    List<SharedElem> getOldRights(JsonArray oldShared, JsonArray newShare);

    /**
     * Return a list of SharedElem wich were present in the object and are not update in new Share
     * *
     * @param oldShared old rights of the object
     * @param newShare new rights to apply
     * @return
     */
    List<SharedElem> getOldRights(JsonArray oldShared, List<SharedElem> newShare);

    /**
     *
     * Return a list of SharedElem wich were present in the object and are not update in new Share
     * @param oldSharedElems old rights of the object
     * @param newSharedElems new rights to apply
     * @return
     */
    List<SharedElem> getOldRights(List<SharedElem> oldSharedElems, List<SharedElem> newSharedElems);

    /**
     *
     * @param shares
     * @return
     */
    List<SharedElem> getSharedElemList(JsonArray shares);

    /**
     *
     * @param shares
     * @return
     */

    List<SharedElem> getSharedElemList(JsonObject shares);

    /**
     * Get the old object to update
     *
     * @param id
     * @param collection
     * @return the old object
     */
    Future<JsonObject> getOldDataToUpdate(String id, String collection);


    /**
     * Get the rights to delete of the object
     *
     * @param id
     * @param newSharedElem
     * @param boardCollection
     * @return
     */
    Future<List<SharedElem>> getDeletedRights(String id, List<SharedElem> newSharedElem, String boardCollection);
}
