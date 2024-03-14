package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.ShareHelper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.wseduc.webutils.http.Binding;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

public class SetShareRights implements ResourcesProvider {
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        final String id = request.params().get(Field.ID);
        final String type = request.params().get(Field.TYPE);

        JsonObject query = new JsonObject().put(Field._ID, id)
                .put(Field.OWNERID, user.getUserId());

        MongoAppFilter.executeCountQuery(request, type.equals(Field.FOLDER) ? CollectionsConstant.FOLDER_COLLECTION : CollectionsConstant.BOARD_COLLECTION,
                query, 1, res -> {
            handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
        });
    }
}
