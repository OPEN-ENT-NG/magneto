package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
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

public class DeleteBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {

        RequestUtils.bodyToJson(request, body -> {
            JsonArray boardIds = body.getJsonArray(Field.BOARDIDS, new JsonArray());

            JsonObject query = new JsonObject()
                    .put(Field._ID, new JsonObject().put(Mongo.IN, boardIds))
                    .put(Field.OWNERID, user.getUserId());

            MongoAppFilter.executeCountQuery(request, CollectionsConstant.BOARD_COLLECTION, query, boardIds.size(), res -> {
                handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
            });
        });
    }
}
