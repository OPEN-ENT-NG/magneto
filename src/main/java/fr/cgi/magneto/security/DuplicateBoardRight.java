package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.service.impl.DefaultBoardService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

public class DuplicateBoardRight implements ResourcesProvider {
    protected static final Logger log = LoggerFactory.getLogger(DefaultBoardService.class);

    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        MongoDb mongo = MongoDb.getInstance();

        String boardId = request.getParam(Field.BOARDID);
        JsonObject query = getDuplicateRightQuery(user, boardId);


        mongo.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            handler.handle(either.isRight() && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
        }));
    }

    private static JsonObject getDuplicateRightQuery(UserInfos user, String boardId) {

    JsonArray boardIdArray = new JsonArray().add(boardId);

    JsonObject duplicationRightOptions = new JsonObject()
            .put(Field._ID, boardId)
            .put(Field.DELETED, false)
            .put(Mongo.OR,
                    new JsonArray()
                            .add(new JsonObject().put(Mongo.AND, new JsonArray()
                                    .add(new JsonObject()
                                            .put(Field.OWNERID, user.getUserId())) //user is board owner
                                    .add(new JsonObject().put(Mongo.OR, new JsonArray()
                                            .add(new JsonObject().put(String.format("%s.%s", Field.FOLDERS, Field.BOARDIDS), new JsonObject().put(Mongo.NIN, boardIdArray))) //is main page
                                            .add(new JsonObject().put(Mongo.AND, new JsonArray()
                                                    .add(new JsonObject()
                                                            .put(String.format("%s.%s", Field.FOLDERS, Field.BOARDIDS), new JsonObject()
                                                                    .put(Mongo.IN, boardIdArray)))
                                                    .add(new JsonObject()
                                                            .put(Mongo.OR, new JsonArray()
                                                                    .add(new JsonObject().put(String.format("%s.%s", Field.FOLDERS, Field.OWNERID), user.getUserId())) //user is folder owner
                                                                    .add(new JsonObject() //folder shared to user with publish right
                                                                            .put(String.format("%s.%s", Field.FOLDERS, Field.SHARED), new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                                                                                    .put(Field.USERID, user.getUserId())
                                                                                    .put(Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT, true)
                                                                            )))
                                                                    .add(new JsonObject() //folder shared to group with publish right
                                                                            .put(String.format("%s.%s", Field.FOLDERS, Field.SHARED), new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                                                                                    .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                                                                                    .put(Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT, true)
                                                                            )))
                                                            )
                                                    )
                                            ))
                                    ))
                            ))
                            .add(new JsonObject().put(Mongo.AND, new JsonArray()
                                    .add(new JsonObject()
                                            .put(Mongo.OR, new JsonArray()
                                                    .add(new JsonObject() //board shared to user with contrib right
                                                            .put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                                                                    .put(Field.USERID, user.getUserId())
                                                                    .put(Rights.SHAREBOARDCONTROLLER_INITCONTRIBRIGHT, true)
                                                            )))
                                                    .add(new JsonObject() //folder shared to group with contrib right
                                                            .put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                                                                    .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                                                                    .put(Rights.SHAREBOARDCONTROLLER_INITCONTRIBRIGHT, true)
                                                            )))
                                    ))
                                    .add(new JsonObject().put(Mongo.OR, new JsonArray()
                                            .add(new JsonObject().put(String.format("%s.%s", Field.FOLDERS, Field.BOARDIDS), new JsonObject().put(Mongo.NIN, boardIdArray))) //is main page
                                            .add(new JsonObject().put(Mongo.AND, new JsonArray()
                                                    .add(new JsonObject()
                                                            .put(String.format("%s.%s", Field.FOLDERS, Field.BOARDIDS), new JsonObject()
                                                                    .put(Mongo.IN, boardIdArray)))
                                                            .add(new JsonObject()
                                                                    .put(String.format("%s.%s", Field.FOLDERS, Field.OWNERID), user.getUserId())) //user is folder owner
                                            ))
                                    ))
                            ))
            );

        MongoQuery query = new MongoQuery(CollectionsConstant.BOARD_COLLECTION);

        query
            .lookUp(CollectionsConstant.FOLDER_COLLECTION, Field._ID, Field.BOARDIDS, Field.FOLDERS)
            .match(duplicationRightOptions)
            .project(new JsonObject()
                    .put(Field._ID, 0)
                    .put(Field.COUNT, new JsonObject().put(Mongo.SUM, 1)));

        return query.getAggregate();
    }



}
