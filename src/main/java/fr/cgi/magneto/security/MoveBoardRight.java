package fr.cgi.magneto.security;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.MongoQuery;
import fr.wseduc.webutils.http.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.http.filter.*;
import org.entcore.common.user.*;

public class MoveBoardRight implements ResourcesProvider {
    @Override
    public void authorize(HttpServerRequest request, Binding binding, UserInfos user,
                          Handler<Boolean> handler) {
        request.bodyHandler(body -> {
            String folderId = request.getParam(Field.FOLDERID);
            JsonObject bodyObject = new JsonObject(body);
            JsonArray boardIds = bodyObject.getJsonArray(Field.BOARDIDS, new JsonArray());

            if (!folderId.isEmpty() && folderId != null && !folderId.equals(Field.MY_BOARDS)) {
                //is board owner
                JsonObject isBoardsOwner =  new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, boardIds))
                        .put(Field.OWNERID, user.getUserId());
                MongoAppFilter.executeCountQuery(request, CollectionsConstant.BOARD_COLLECTION, isBoardsOwner, boardIds.size(), boardResult -> {
                    if (Boolean.FALSE.equals(boardResult)) {
                        handler.handle(false);
                        return;
                    }
                    //is folder owner or shared with publish rights
                    JsonObject destinationFolderRights = new JsonObject();
                    ShareHelper.checkFolderShareRightsQuery(user, folderId, destinationFolderRights, Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT);
                    MongoAppFilter.executeCountQuery(request, CollectionsConstant.FOLDER_COLLECTION, destinationFolderRights, 1, folderResult -> {
                        handler.handle(Boolean.TRUE.equals(folderResult) && WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
                    });
                });

            } else { //is main folder
                handler.handle(WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD));
            }


        });
    }
}
