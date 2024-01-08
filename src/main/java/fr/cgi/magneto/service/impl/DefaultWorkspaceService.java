package fr.cgi.magneto.service.impl;


import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.enums.EventBusActions;
import fr.cgi.magneto.helper.EventBusHelper;
import fr.cgi.magneto.helper.WorkspaceHelper;
import fr.cgi.magneto.service.*;
import fr.wseduc.mongodb.*;
import io.vertx.core.*;
import io.vertx.core.eventbus.*;
import io.vertx.core.json.*;
import io.vertx.core.logging.*;
import org.entcore.common.mongodb.*;

import java.util.*;

public class DefaultWorkspaceService implements WorkspaceService {

    private final EventBus eb;
    private final MongoDb mongoDb;
    protected static final Logger log = LoggerFactory.getLogger(DefaultWorkspaceService.class);


    public DefaultWorkspaceService (Vertx vertx, MongoDb mongoDb) {
        this.eb = vertx.eventBus();
        this.mongoDb = mongoDb;
    }


    @Override
    public Future<JsonObject> getDocument(String documentId) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject action = new JsonObject()
                .put(Field.ACTION, EventBusActions.GETDOCUMENT.action())
                .put(Field.ID, documentId);
        EventBusHelper.requestJsonObject(EventBusActions.EventBusAddresses.WORKSPACE_BUS_ADDRESS.address(), eb, action)
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::getDocument] Failed to get document", this.getClass().getSimpleName());
                    promise.fail(message);
                })
                .onSuccess(promise::complete);
        return promise.future();
    }

    @Override
    public Future<Boolean> canEditDocument(String userId, String documentId) {
        Promise<Boolean> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, documentId)
                .put(Mongo.OR, new JsonArray()
                        .add(new JsonObject()
                                .put(Field.SHARED, new JsonObject()
                                        .put(Mongo.ELEMMATCH, new JsonObject()
                                                .put(Field.USERID, userId)
                                                .put(Rights.WORKSPACECONTROLLER_UPDATEDOCUMENT, true)
                                        )
                                )
                        )
                        .add(new JsonObject()
                                .put(Field.OWNER, userId))
                );


        mongoDb.find(CollectionsConstant.WORKSPACE_DOCUMENTS, query, MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::canEditDocument] Failed to access document info",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(results.right().getValue().size() > 0);
        }));
        return promise.future();
    }


    @Override
    public Future<JsonObject> setShareRights(List<String> documentIds, JsonObject share) {
        Promise<JsonObject> promise = Promise.promise();
        JsonArray shareArray = WorkspaceHelper.toMongoWorkspaceShareFormat(share);

        if(checkOldRights(share,new JsonObject())) { //TODO remplacer new JsonObject() par les droits du parents dans la MAG-286
            JsonObject query = new JsonObject()
                    .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(documentIds)));

            JsonObject update = new JsonObject()
                    .put(Mongo.SET, new JsonObject()
                            .put(Field.SHARED, shareArray)
                            .put(Field.INHERITEDSHARES, shareArray)
                            .put(Field.ISSHARED, true));

            mongoDb.update(CollectionsConstant.WORKSPACE_DOCUMENTS, query, update, false, true,
                    MongoDbResult.validActionResultHandler(results -> {
                        if (results.isLeft()) {
                            String message = String.format("[Magneto@%s::setShareRights] Failed to set share rights",
                                    this.getClass().getSimpleName());
                            log.error(String.format("%s : %s", message, results.left().getValue()));
                            promise.fail(message);
                            return;
                        }
                        promise.complete(results.right().getValue());
                    }));
        }else{
            promise.fail(String.format("[Magneto@%s::setShareRights] Failed during checking rights",
                    this.getClass().getSimpleName()));
        }
        return promise.future();
    }

    private boolean checkOldRights(JsonObject newRights, JsonObject previousRights) {
        return checkRights(newRights.getJsonObject(Field.USERS, new JsonObject()), previousRights.getJsonObject(Field.USERS, new JsonObject()))
                && checkRights(newRights.getJsonObject(Field.GROUPS, new JsonObject()), previousRights.getJsonObject(Field.GROUPS, new JsonObject())) &&
                checkRights(newRights.getJsonObject(Field.BOOKMARKS, new JsonObject()), previousRights.getJsonObject(Field.BOOKMARKS, new JsonObject()));
    }

    private boolean checkRights(JsonObject newRights, JsonObject previousRights) {
        return newRights.fieldNames().stream().noneMatch(newKey ->
                previousRights.fieldNames().stream().anyMatch(oldKey ->
                        oldKey.equals(newKey)
                                && newRights.getJsonArray(newKey).size() < previousRights.getJsonArray(newKey).size()
                )
        );
    }


}
