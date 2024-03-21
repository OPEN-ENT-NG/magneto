package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.boards.BoardAccess;
import fr.cgi.magneto.service.BoardAccessService;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;

import java.util.*;
import java.util.stream.Collectors;

public class DefaultBoardAccessService implements BoardAccessService {
    private final MongoDb mongoDb;
    private final String collection;

    private final int VIEW_LIMIT = 5;

    protected static final Logger log = LoggerFactory.getLogger(DefaultBoardAccessService.class);

    public DefaultBoardAccessService(String collection, MongoDb mongo) {
        this.collection = collection;
        this.mongoDb = mongo;
    }

    @Override
    public Future<Void> insertAccess(List<String> boardsIds, String userId) {
        Promise<Void> promise = Promise.promise();
        BoardAccess boardAccess = new BoardAccess();
        boardAccess.setBoardId(boardsIds.get(0));
        boardAccess.setUserId(userId);
        mongoDb.insert(this.collection, boardAccess.toJson(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::insertAccess] Failed to insert view ", this.getClass().getSimpleName());
                log.error(String.format("%s. %s", message, results.left().getValue()));
                promise.fail(message);
            }
            promise.complete();
        }));
        return promise.future();
    }

    @Override
    public Future<List<String>> getLastAccess(String userId) {
        Promise<List<String>> promise = Promise.promise();

        JsonObject query = getBoardAccessQuery(userId);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::fetchAllCardsByBoardCount] Failed to last accesses", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(result.stream().map(elem -> ((JsonObject) elem).getString(Field._ID, ""))
                        .collect(Collectors.toList()));
            }
        }));
        return promise.future();
    }

    private JsonObject getBoardAccessQuery(String userId) {
        Map<String, JsonObject> externalFieldAccumulators = new HashMap<>();

        externalFieldAccumulators.put(Field.CREATIONDATE, new JsonObject().put(Mongo.MAX, String.format("$%s", Field.CREATIONDATE)));

        return new MongoQuery(this.collection)
                .match(new JsonObject().put(Field.USERID, userId))
                .group(Field.BOARDID, externalFieldAccumulators)
                .sort(Field.CREATIONDATE, -1)
                .limit(5).getAggregate();
    }
}
