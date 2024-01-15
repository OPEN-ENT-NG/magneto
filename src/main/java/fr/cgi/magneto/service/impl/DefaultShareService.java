package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.share.SharedElem;
import fr.cgi.magneto.service.ShareService;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;

import java.util.ArrayList;
import java.util.List;

public class DefaultShareService implements ShareService {

    public final MongoDb mongoDb;
    protected static final Logger log = LoggerFactory.getLogger(DefaultShareService.class);

    public DefaultShareService(MongoDb mongo) {
        this.mongoDb = mongo;
    }

    @Override
    public Future<JsonObject> upsertSharedArray(String id, JsonObject share, String collection) {
        Promise<JsonObject> promise = Promise.promise();
        JsonArray newShare = toMongoBasicShareFormat(share);
        JsonObject query = new JsonObject().put(Field._ID, id);
        JsonObject update = new JsonObject()
                .put(Mongo.SET, new JsonObject()
                        .put(Field.SHARED, newShare));
        getOldDataToUpdate(id, collection).onSuccess(success -> {
           List<SharedElem> sharedElems = getOldRights(success, newShare);
           sharedElems.forEach(sharedElem ->{
               newShare.add(sharedElem.toJson());
           });
            mongoDb.update(collection, query, update, MongoDbResult.validActionResultHandler(results -> {
                if (results.isLeft()) {
                    String message = String.format("[Magneto@%s::upsertSharedArray] Failed to upsertSharedArray", this.getClass().getSimpleName());
                    log.error(String.format("%s : %s", message, results.left().getValue()));
                    promise.fail(results.left().getValue());
                }
                promise.complete(results.right().getValue());
            }));
        });

        return promise.future();
    }

    private static List<SharedElem> getOldRights(JsonObject success, JsonArray newShare) {
        List<SharedElem> oldSharedElems = new ArrayList<>();
        List<SharedElem> newSharedElems = new ArrayList<>();
        success.getJsonArray("shared").forEach(elem -> {
            JsonObject elemJO = (JsonObject) elem;
            SharedElem sharedElem = new SharedElem();
            sharedElem.set(elemJO);
            oldSharedElems.add(sharedElem);

        });
        newShare.forEach(newShareElem -> {
            JsonObject newShareElemJO = (JsonObject) newShareElem;
            SharedElem sharedElem = new SharedElem();
            sharedElem.set(newShareElemJO);
            newSharedElems.add(sharedElem);
        });

        List<SharedElem> elementsToAdd = new ArrayList<>();
        oldSharedElems.forEach(oldElem -> {
            if ( newSharedElems.stream().noneMatch(oldElem::hasSameId)) {
                elementsToAdd.add(oldElem);
            }
        });
        return elementsToAdd;
    }

    private static JsonArray toMongoBasicShareFormat(JsonObject shareJson) {
        JsonArray resultJsonArray = new JsonArray();
        processShareJsonField(shareJson, Field.USERS, Field.USERID, resultJsonArray);
        processShareJsonField(shareJson, Field.GROUPS, Field.GROUPID, resultJsonArray);
        processShareJsonField(shareJson, Field.BOOKMARKS, Field.BOOKMARKID, resultJsonArray);
        return resultJsonArray;

    }

    private static void processShareJsonField(JsonObject shareJson, String fieldKey, String idKey, JsonArray resultJsonArray) {
        if (shareJson.containsKey(fieldKey)) {
            shareJson.getJsonObject(fieldKey, new JsonObject()).forEach(entry -> {
                String id = entry.getKey();
                JsonArray rights = (JsonArray) entry.getValue();
                JsonObject object = new JsonObject().put(idKey, id);
                processRights(rights, object);
                resultJsonArray.add(object);
            });
        }
    }

    private static void processRights(JsonArray rights, JsonObject targetObject) {
        rights.forEach(right -> targetObject.put(right.toString(), true));
    }

    private Future<JsonObject> getOldDataToUpdate(String folderId, String collection) {
        Promise<JsonObject> promise = Promise.promise();
        MongoQuery query = new MongoQuery(collection);
        query.match(new JsonObject().put(Field._ID, folderId));
        mongoDb.command(query.getAggregate().toString(), MongoDbResult.validResultHandler(resultMongo -> {
            if (resultMongo.isRight()) {
                JsonObject result = resultMongo.right().getValue()
                        .getJsonObject(Mongo.CURSOR, new JsonObject())
                        .getJsonArray(Mongo.FIRSTBATCH, new JsonArray())
                        .getJsonObject(0);
                promise.complete(result);
            } else {
                String message = String.format("[Magneto@%s::updateOldFolder] Failed to update old folder",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, resultMongo.left().getValue()));
                promise.fail(message);
            }
        }));
        return promise.future();
    }
}
