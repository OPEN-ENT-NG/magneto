package fr.cgi.magneto.security;

import com.mongodb.client.model.Filters;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.excpetion.RessourceNotFoundException;
import fr.cgi.magneto.helper.HttpRequestHelper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.bson.conversions.Bson;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

public class ReadBoardRight  implements ResourcesProvider {


    protected static final Logger log = LoggerFactory.getLogger(Renders.class);
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user, Handler<Boolean> handler) {

        MongoDb mongo = MongoDb.getInstance();
        RequestUtils.bodyToJson(request, body -> {
            String boardId = request.getParam(Field.BOARDID);
            String cardId = request.getParam(Field.ID);

            if (boardId == null && cardId == null) {
                handler.handle(false);
                return;
            }
            //If board id is null, we have to retrieve the board id from the card id
            if (boardId == null || boardId.isEmpty()) {
                getBoardIdByCardId(cardId, mongo)
                        .onSuccess(boardIdRes -> {
                            if (boardIdRes == null) {
                                HttpRequestHelper.sendError(request, new RessourceNotFoundException("Card not found"));
                            }
                            handleHasReadBoardRight(request, user, boardIdRes, handler);
                        })
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::authorize] Failed to retrieve boardId from cardId : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                            HttpRequestHelper.sendError(request, err);
                        });
            } else {
                handleHasReadBoardRight(request, user, boardId, handler);
            }
        });
    }

    private static void handleHasReadBoardRight(HttpServerRequest request, UserInfos user, String boardId, Handler<Boolean> handler){
        MongoAppFilter.executeCountQuery(request, CollectionsConstant.BOARD_COLLECTION, getViewBoardRightQuery(user, boardId), 1, res -> {
            handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
        });
    }

    private static JsonObject getViewBoardRightQuery(UserInfos user, String boardId) {
        JsonObject sharedUserCondition = new JsonObject()
                .put(Field.USERID, user.getUserId())
                .put(Rights.SHAREBOARDCONTROLLER_INITREADRIGHT, true);

        JsonObject sharedGroupCondition = new JsonObject()
                .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                .put(Rights.SHAREBOARDCONTROLLER_INITREADRIGHT, true);

        return new JsonObject()
                .put(Field._ID, boardId)
                .put(Field.DELETED, false)
                .put(Mongo.OR,
                        new JsonArray()
                                .add(new JsonObject()
                                        .put(Field.OWNERID, user.getUserId()))
                                .add(new JsonObject()
                                        .put(Field.PUBLIC, true))
                                .add(new JsonObject().put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, sharedUserCondition)))
                                .add(new JsonObject().put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, sharedGroupCondition)))
                );
    }

    private Future<String> getBoardIdByCardId(String cardId, MongoDb mongo) {
        Promise promise = Promise.promise();
        Bson matcher = Filters.eq(Field._ID, cardId);

        mongo.findOne(CollectionsConstant.CARD_COLLECTION, MongoQueryBuilder.build(matcher), MongoDbResult.validResultHandler(result -> {
            if (result.isLeft()) {
                promise.fail(new RessourceNotFoundException("No ressources found"));
                return;
            }
            promise.complete(result.right().getValue().getString(Field.BOARDID));
        }));
        return promise.future();
    }

}
