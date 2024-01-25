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
     * @param share new share to update
     * @param collection mongo collection to apply
     * @param checkOldRights need to save the old rights
     * @return
     */
    Future<JsonObject> upsertSharedArray(String id, JsonObject share, String collection, boolean checkOldRights);

    /**
     * Update or insert a shared array of rights in the element
     *
     * @param id
     * @param newShare new rights to apply
     * @param deletedShares rights to delete
     * @param collection mongo collection to apply
     * @param checkOldRights need  to save the old rights
     * @return
     */
    Future<JsonObject> upsertSharedArray(String id, List<SharedElem> newShare, List<SharedElem> deletedShares, String collection, boolean checkOldRights);

    /**
     * Return a list of SharedElem which were present in the object and are not update in new Share
     *
     * @param oldShared        old rights of the object
     * @param newShare         new rights to apply
     * @param checkRightLength
     * @return list of SharedElem for old rights to keep
     */
    List<SharedElem> getOldRights(JsonArray oldShared, JsonArray newShare, boolean checkRightLength);

    /**
     * Return a list of SharedElem which were present in the object and are not update in new Share
     * *
     *
     * @param oldShared        old rights of the object
     * @param newShare         new rights to apply
     * @param checkRightLength
     * @return
     */
    List<SharedElem> getOldRights(JsonArray oldShared, List<SharedElem> newShare, boolean checkRightLength);

    /**
     * Return a list of SharedElem which were present in the object and are not update in new Share
     *
     * @param oldSharedElems   old rights of the object
     * @param newSharedElems   new rights to apply
     * @param checkRightLength
     * @return
     */
    List<SharedElem> getOldRights(List<SharedElem> oldSharedElems, List<SharedElem> newSharedElems, boolean checkRightLength);

    /**
     * format shared array to SharedElemList
     *
     * @param shares
     * @return
     */
    List<SharedElem> getSharedElemList(JsonArray shares);


    JsonObject getSharedJsonFromList(List<SharedElem> elems);

    /**
     * format shared array to SharedElemList
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
     * @param id id of object
     * @param newSharedElem new rights to apply
     * @param collection
     * @return
     */
    Future<List<SharedElem>> getDeletedRights(String id, List<SharedElem> newSharedElem, String collection);

    /**
     * Check if the rights are not less than the parent
     *
     * @param id
     * @param newSharedElem new rights to apply
     * @param collection mongo collection to check
     * @return
     */
    Future<Boolean> checkParentRights(String id, List<SharedElem> newSharedElem, String collection);

    /**
     * Check if the rights are not less than the parent
     *
     * @param newSharedElem new rights to apply
     * @param parent parent object
     * @return
     */
    boolean checkRights(List<SharedElem> newSharedElem, JsonObject parent);
}
