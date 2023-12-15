package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.constants.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import java.util.*;

public class WorkspaceHelper {

    private WorkspaceHelper() {
        throw new IllegalStateException("Utility class");
    }


    /**
     * Converts the share body from the share API to the format expected by the mongo share API for workspace documents
     * @param shareApiObject the share body from the share API
     *                       format: {"users":{"8c0c0985-e895-47af-a4a6-b85e93b10e47":
     *                     ["fr-cgi-magneto-controller-ShareBoardController|initReadRight",
     *                     "fr-cgi-magneto-controller-ShareBoardController|initContribRight",
     *                     "fr-cgi-magneto-controller-ShareBoardController|initPublishRight"],
     *                     "afa24edd-0c10-4d07-c2b9-e737b0aa0c0d":
     *                     ["fr-cgi-magneto-controller-ShareBoardController|initReadRight"]
     *                     },"groups":{},"bookmarks":{}}
     *
     * @return the share body expected by the mongo share API (/!\ for workspace documents)
     */
    @SuppressWarnings("unchecked")
    public static JsonArray toMongoWorkspaceShareFormat(JsonObject shareApiObject) {
        JsonObject users = shareApiObject.getJsonObject(Field.USERS);
        JsonObject groups = shareApiObject.getJsonObject(Field.GROUPS);
        JsonObject bookmarks = shareApiObject.getJsonObject(Field.BOOKMARKS);

        JsonArray mongoShareArray = new JsonArray();
        if (users != null) {
            users.forEach(userObj -> {
                String userId = userObj.getKey();
                List<String> rights = magnetoShareToWorkspace(((JsonArray) userObj.getValue()).getList());

                JsonObject mongoShareObject = new JsonObject();
                mongoShareObject.put(Field.USERID, userId);
                rights.forEach(right -> mongoShareObject.put(right, true));

                mongoShareArray.add(mongoShareObject);
            });
        }

        if (groups != null) {
            groups.forEach(groupObj -> {
                String groupId = groupObj.getKey();
                List<String> rights = magnetoShareToWorkspace(((JsonArray) groupObj.getValue()).getList());

                JsonObject mongoShareObject = new JsonObject();
                mongoShareObject.put(Field.GROUPID, groupId);
                rights.forEach(right -> mongoShareObject.put(right, true));

                mongoShareArray.add(mongoShareObject);
            });
        }

        if (bookmarks != null) {
            bookmarks.forEach(bookmarkObj -> {
                String bookmarkId = bookmarkObj.getKey();
                List<String> rights = magnetoShareToWorkspace(((JsonArray) bookmarkObj.getValue()).getList());

                JsonObject mongoShareObject = new JsonObject();
                mongoShareObject.put(Field.BOOKMARKID, bookmarkId);
                rights.forEach(right -> mongoShareObject.put(right, true));

                mongoShareArray.add(mongoShareObject);
            });
        }


        return mongoShareArray;
    }

    /**
     * Converts a share body from mongo data to the format expected by the mongo share APIs
     * (if the user is not the owner, only the read right is converted), adds owner to share body if user is not the owner
     * @param shareMongoObject the share body from mongo data
     *                         format example : [{"userId":"8c0c0985-e895-47af-a4a6-b85e93b10e47",
     *                         "fr-cgi-magneto-controller-ShareBoardController|initReadRight":true},
     *                         {"userId":"afa24edd-0c10-4d07-c2b9-e737b0aa0c0d",
     *                         "fr-cgi-magneto-controller-ShareBoardController|initReadRight":true}]
     *
     * @return the share body expected by the mongo share APIs
     */
    public static JsonObject toAPIShareFormat(JsonArray shareMongoObject, boolean isOwner, String boardOwnerId) {
        JsonObject users = new JsonObject();
        JsonObject groups = new JsonObject();
        JsonObject bookmarks = new JsonObject();
        String[] allRights = {
                Rights.SHAREBOARDCONTROLLER_INITREADRIGHT,
                Rights.SHAREBOARDCONTROLLER_INITCONTRIBRIGHT,
                Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT,
                Rights.SHAREBOARDCONTROLLER_INITMANAGERRIGHT
        };

        String[] readRights = {
                Rights.SHAREBOARDCONTROLLER_INITREADRIGHT
        };


        String[] shareRights = isOwner? allRights : readRights;

        shareMongoObject.forEach(sO -> {
            JsonObject shareObj = (JsonObject) sO;
            JsonArray rights = new JsonArray();
            for (String right : shareRights) {
                if (Boolean.TRUE.equals(shareObj.getBoolean(right))) {
                    rights.add(right);
                }
            }

            if (shareObj.getString(Field.USERID) != null) {
                users.put(shareObj.getString(Field.USERID), rights);
            }

            if (shareObj.getString(Field.GROUPID) != null) {
                groups.put(shareObj.getString(Field.GROUPID), rights);
            }

            if (shareObj.getString(Field.BOOKMARKID) != null) {
                bookmarks.put(shareObj.getString(Field.BOOKMARKID), rights);
            }
        });

        if (!isOwner) {
            users.put(boardOwnerId, new JsonArray().add(Rights.SHAREBOARDCONTROLLER_INITREADRIGHT));
        }

        return new JsonObject().put(Field.USERS, users).put(Field.GROUPS, groups).put(Field.BOOKMARKS, bookmarks);
    }

    /**
     * Convert magneto share right to workspace share rights
     * @param shareMagneto a list of magneto sharing rights
     * @return a list of workspace sharing rights
     */
    public static List<String> magnetoShareToWorkspace(List<String> shareMagneto) {
        List<String> baseRights = new ArrayList<>();
        baseRights.add(Rights.WORKSPACECONTROLLER_GETDOCUMENT);
        baseRights.add(Rights.WORKSPACECONTROLLER_GETDOCUMENTPROPERTIES);
        baseRights.add(Rights.WORKSPACECONTROLLER_COPYDOCUMENTS);
        baseRights.add(Rights.WORKSPACECONTROLLER_GETREVISION);
        baseRights.add(Rights.WORKSPACECONTROLLER_COPYFOLDER);
        baseRights.add(Rights.WORKSPACECONTROLLER_GETPREVIEW);
        baseRights.add(Rights.WORKSPACECONTROLLER_COPYDOCUMENT);
        baseRights.add(Rights.WORKSPACECONTROLLER_GETDOCUMENTBASE64);
        baseRights.add(Rights.WORKSPACECONTROLLER_GETDOCUMENT);
        baseRights.add(Rights.WORKSPACECONTROLLER_LISTREVISIONS);
        if (shareMagneto == null || shareMagneto.isEmpty()) {
            return new ArrayList<>();
        }

        if (shareMagneto.contains(Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT)) {
            baseRights.add(Rights.WORKSPACECONTROLLER_UPDATEDOCUMENT);
        }

        return baseRights;
    }
}
