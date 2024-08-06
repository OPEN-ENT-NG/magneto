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
import java.util.stream.Collectors;

public class DefaultShareService implements ShareService {

    public final MongoDb mongoDb;
    protected static final Logger log = LoggerFactory.getLogger(DefaultShareService.class);

    public DefaultShareService(MongoDb mongo) {
        this.mongoDb = mongo;
    }

    @Override
    public Future<JsonObject> upsertSharedArray(String id, JsonObject share, String collection, boolean checkOldRights) {
        Promise<JsonObject> promise = Promise.promise();
        JsonArray newShare = toMongoBasicShareFormat(share);

        if (checkOldRights) {
            getOldDataToUpdate(id, collection).onSuccess(success -> {
                List<SharedElem> sharedElems = getOldRights(success.getJsonArray(Field.SHARED, new JsonArray()), newShare, true);
                sharedElems.forEach(sharedElem -> {
                    newShare.add(sharedElem.toJson());
                });

                updateMongo(collection, promise, id, newShare);
            });
        } else {
            updateMongo(collection, promise, id, newShare);
        }

        return promise.future();
    }

    @Override
    public Future<JsonObject> upsertSharedArray(String id, List<SharedElem> newShare, List<SharedElem> deletedShares, String collection, boolean checkOldRights) {
        Promise<JsonObject> promise = Promise.promise();

        JsonArray shares = new JsonArray();

        if (checkOldRights) {
            getOldDataToUpdate(id, collection).onSuccess(success -> {
                List<SharedElem> sharedElems = getOldRights(success.getJsonArray(Field.SHARED, new JsonArray()), newShare, true);
                sharedElems.addAll(newShare);

                //remove duplicate
                List<SharedElem> elemsToRemove = new ArrayList<>();
                sharedElems.forEach(sharedElem1 -> {
                    sharedElems.forEach(sharedElem2 -> {
                        if (sharedElem1 != sharedElem2 && sharedElem2.hasSameId(sharedElem1) && sharedElem1.getRights().size() < sharedElem2.getRights().size()) {
                            elemsToRemove.add(sharedElem2);
                        }
                    });
                });
                sharedElems.removeAll(elemsToRemove);

                sharedElems.forEach(sharedElem -> {
                    if (deletedShares.stream().noneMatch(sharedElem::hasSameId)) {
                        shares.add(sharedElem.toJson());
                    }
                });
                updateMongo(collection, promise, id, shares);
            });
        } else {
            newShare.forEach(elem -> shares.add(elem.toJson()));
            updateMongo(collection, promise, id, shares);
        }

        return promise.future();
    }

    private void updateMongo(String collection, Promise<JsonObject> promise, String id, JsonArray newShare) {
        JsonObject query = new JsonObject().put(Field._ID, id).put(Field.DELETED, false);

        JsonObject update = new JsonObject()
                .put(Mongo.SET, new JsonObject()
                        .put(Field.SHARED, newShare));
        mongoDb.update(collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateMongo] Failed to updateMongo", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(results.left().getValue());
            }
            promise.complete(results.right().getValue());
        }));
    }


    @Override
    public List<SharedElem> getOldRights(JsonArray oldShared, JsonArray newShare, boolean checkRightLength) {
        List<SharedElem> oldSharedElems = getSharedElemList(oldShared);
        List<SharedElem> newSharedElems = getSharedElemList(newShare);

        return getOldRights(oldSharedElems, newSharedElems, checkRightLength);
    }

    @Override
    public List<SharedElem> getOldRights(JsonArray oldShared, List<SharedElem> newShare, boolean checkRightLength) {
        List<SharedElem> oldSharedElems = getSharedElemList(oldShared);

        return getOldRights(oldSharedElems, newShare, checkRightLength);
    }

    @Override
    public List<SharedElem> getOldRights(List<SharedElem> oldSharedElems, List<SharedElem> newSharedElems, boolean checkRightLength) {
        List<SharedElem> elementsToAdd = new ArrayList<>();
        oldSharedElems.forEach(oldElem -> {
            if (newSharedElems.stream().noneMatch(oldElem::hasSameId)) {
                elementsToAdd.add(oldElem);
            } else {
                // add elements common to old and new shared elements if old element has higher rights and remove lower right element
                newSharedElems.stream().forEach(element -> {
                    if (element.hasSameId(oldElem) && oldElem.getRights().size() > element.getRights().size() && checkRightLength) {
                        elementsToAdd.add(oldElem);
                        elementsToAdd.remove(element);
                    }
                });
            }
        });
        return elementsToAdd;
    }

    @Override
    public List<SharedElem> getSharedElemList(JsonArray shares) {
        List<SharedElem> sharedElems = new ArrayList<>();
        shares.forEach(share -> {
            JsonObject newShareElemJO = (JsonObject) share;
            SharedElem sharedElem = new SharedElem();
            sharedElem.set(newShareElemJO);
            sharedElems.add(sharedElem);
        });
        return sharedElems;
    }

    @Override
    public JsonObject getSharedJsonFromList(List<SharedElem> elems) {
        JsonObject result = new JsonObject();
        elems.forEach(elem -> {
            if(elem.getTypeId().equals(Field.USERID)) {
                result.put(Field.USERS,result.getJsonObject(Field.USERS, new JsonObject()).put(elem.getId(),elem.getRights()));
            }else if(elem.getTypeId().equals(Field.GROUPID)) {
                result.put(Field.GROUPS,result.getJsonObject(Field.GROUPS, new JsonObject()).put(elem.getId(),elem.getRights()));
            }
        });
        return result;
    }

    @Override
    public List<SharedElem> getSharedElemList(JsonObject shares) {
        return getSharedElemList(toMongoBasicShareFormat(shares));
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

    @Override
    public Future<JsonObject> getOldDataToUpdate(String folderId, String collection) {
        Promise<JsonObject> promise = Promise.promise();
        MongoQuery query = new MongoQuery(collection);
        query.match(new JsonObject().put(Field._ID, folderId));
        mongoDb.command(query.getAggregate().toString(), MongoDbResult.validResultHandler(resultMongo -> {
            if (resultMongo.isRight()) {
                JsonArray firstBatchResult = resultMongo.right().getValue()
                        .getJsonObject(Mongo.CURSOR, new JsonObject())
                        .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());
                promise.complete(firstBatchResult.isEmpty() ? new JsonObject() : firstBatchResult.getJsonObject(0));
            } else {
                String message = String.format("[Magneto@%s::getOldDataToUpdate] Failed to update old folder",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, resultMongo.left().getValue()));
                promise.fail(message);
            }
        }));
        return promise.future();
    }

    @Override
    public Future<List<SharedElem>> getDeletedRights(String id, List<SharedElem> newSharedElem, String boardCollection) {
        Promise<List<SharedElem>> promise = Promise.promise();
        getOldDataToUpdate(id, boardCollection).onSuccess(success -> {
            promise.complete(getOldRights(success.getJsonArray(Field.SHARED, new JsonArray()), newSharedElem, false));
        });
        return promise.future();
    }

    @Override
    public Future<Boolean> checkParentRights(String id, List<SharedElem> newSharedElem, String collection) {
        Promise<Boolean> promise = Promise.promise();
        this.getOldDataToUpdate(id, collection).onSuccess(folder -> {
            if (folder.getValue(Field.PARENTID) == null) {
                promise.complete(true);
            } else {
                this.getOldDataToUpdate(folder.getString(Field.PARENTID, ""), collection)
                        .onSuccess(parent -> {
                            promise.complete(checkRights(newSharedElem, parent));
                        }).onFailure(error -> promise.fail(error.getMessage()));
            }
        }).onFailure(error -> promise.fail(error.getMessage()));

        return promise.future();
    }

    @Override
    public boolean checkRights(List<SharedElem> newSharedElem, JsonObject parent) {
        List<SharedElem> parentRights = getSharedElemList(parent.getJsonArray(Field.SHARED, new JsonArray()));

        //remove bookmark
       parentRights = parentRights.stream().filter(elem -> !elem.getTypeId().equals(Field.BOOKMARKID)).collect(Collectors.toList());

        return parentRights.stream()
                .allMatch(parentRight -> newSharedElem.stream()
                        .noneMatch(elem -> parentRight.hasSameId(elem) && parentRight.getRights().size() > elem.getRights().size()))
                &&
                //Check if all parentsIds are in the newShared Elem
                parentRights.stream()
                        .allMatch(parentRight -> newSharedElem.stream()
                                .anyMatch(parentRight::hasSameId));

    }
}
