package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.ShareHelper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

public class ManageFolderRight implements ResourcesProvider {
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        final String id = request.getParam(Field.FOLDERID);

        RequestUtils.bodyToJson(request, share -> {

            JsonObject sharedUserCondition = new JsonObject()
                    .put(Field.USERID, user.getUserId())
                    .put(Rights.SHAREBOARDCONTROLLER_INITMANAGERRIGHT, true);

            JsonObject sharedGroupCondition = new JsonObject()
                    .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                    .put(Rights.SHAREBOARDCONTROLLER_INITMANAGERRIGHT, true);

            JsonObject query = new JsonObject()
                    .put(Field._ID, id)
                    .put(Field.DELETED, false)
                    .put(Mongo.OR,
                            new JsonArray()
                                    .add(new JsonObject()
                                            .put(Field.OWNERID, user.getUserId()))
                                    .add(new JsonObject().put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, sharedUserCondition)))
                                    .add(new JsonObject().put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, sharedGroupCondition)))

                    );

            MongoAppFilter.executeCountQuery(request,CollectionsConstant.FOLDER_COLLECTION, query, 1, res -> {
                handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
            });
        });
    }
}
