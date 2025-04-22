package fr.cgi.magneto.service.impl;


import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.core.enums.EventBusActions;
import fr.cgi.magneto.helper.EventBusHelper;
import fr.cgi.magneto.helper.WorkspaceHelper;
import fr.cgi.magneto.service.WorkspaceService;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;

import java.util.List;

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

            JsonObject query = new JsonObject()
                    .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(documentIds)));

            JsonObject update = new JsonObject()
                    .put(Mongo.SET, new JsonObject()
                            .put(Field.SHARED, shareArray)
                            .put(Field.INHERITEDSHARES, shareArray)
                            .put(Field.ISSHARED, false));

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
        return promise.future();
    }
}
