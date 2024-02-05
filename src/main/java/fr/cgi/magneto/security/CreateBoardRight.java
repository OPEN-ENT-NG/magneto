package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.helper.ShareHelper;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.wseduc.webutils.http.Binding;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.MongoAppFilter;
import org.entcore.common.http.filter.ResourcesProvider;
import org.entcore.common.user.UserInfos;

public class CreateBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        request.bodyHandler(body -> {
            JsonObject bodyObject = new JsonObject(body);
            String folderId = bodyObject.getString(Field.FOLDERID, "");

            if (!folderId.isEmpty()) { //is in folder
                JsonObject query = new JsonObject();

                ShareHelper.checkFolderShareRightsQuery(user, folderId, query, Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT);

                MongoAppFilter.executeCountQuery(request, CollectionsConstant.FOLDER_COLLECTION, query, 1, res -> {
                    handler.handle(Boolean.TRUE.equals(res) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
                });
            } else { // is main page
                handler.handle(WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
            }

        });

    }
}