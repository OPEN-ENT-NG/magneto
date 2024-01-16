package fr.cgi.magneto.service;

import fr.cgi.magneto.model.share.SharedElem;
import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface ShareService {
    /**
     * Update or insert a shared array of rights in the element
     * @param id
     * @param share
     * @param collection
     * @param checkOldRights
     * @return
     */
    Future<JsonObject> upsertSharedArray(String id, JsonObject share, String collection, boolean checkOldRights);

    /**
     *  Return a list of SharedElem wich were present in the object and are not update in new Share
     * @param oldShared old rights of the object
     * @param newShare new rights to apply
     * @return list of SharedElem for old rights to keep
     */
    List<SharedElem> getOldRights(JsonArray oldShared, JsonArray newShare);

    /**
     *  Return a list of SharedElem wich were present in the object and are not update in new Share
     * @param oldShared
     * @param newShare new rights but not parsed
     * @return
     */
    List<SharedElem> getOldRights(JsonArray oldShared, JsonObject newShare);
    /**
     * Get the old object to update
     * @param id
     * @param collection
     * @return the old object
     */
    Future<JsonObject> getOldDataToUpdate(String id, String collection);


}
