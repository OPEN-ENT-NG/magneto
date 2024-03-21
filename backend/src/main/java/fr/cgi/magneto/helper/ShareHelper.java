package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.model.share.SharedElem;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.stream.Collectors;

public class ShareHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(ShareHelper.class);

    private ShareHelper() {
    }

    public static List<SharedElem> getSharedElem(JsonArray sharedArray) {

        return sharedArray.stream().map(right -> {
            SharedElem sharedElement = new SharedElem();
            sharedElement.set((JsonObject) right);
            return sharedElement;
        }).collect(Collectors.toList());
    }

    /**
     *Return elems without the same rights as elems 2
     *
     * @param elems
     * @param elems2
     * @return
     */
    public static List<SharedElem> removeCommonRights(List<SharedElem> elems, List<SharedElem> elems2){
        return elems.stream().filter(elem -> elems2.stream().noneMatch(elem::hasSameId)).collect(Collectors.toList());
    }

    /**
     *
     * @param userId
     * @return
     */
    public static SharedElem getOwnerSharedElem(String userId) {
        SharedElem sharedElem = new SharedElem();
        sharedElem.setId(userId);
        sharedElem.setTypeId(Field.USERID);
        sharedElem.addRight(Rights.SHAREBOARDCONTROLLER_INITREADRIGHT);
        sharedElem.addRight(Rights.SHAREBOARDCONTROLLER_INITCONTRIBRIGHT);
        sharedElem.addRight(Rights.SHAREBOARDCONTROLLER_INITPUBLISHRIGHT);
        sharedElem.addRight(Rights.SHAREBOARDCONTROLLER_INITMANAGERRIGHT);
        return sharedElem;
    }

    /**
     * Add owner and right check query for folders
     * @param user {@link UserInfos} the user
     * @param folderId {@link  String} the target folder id
     * @param query {@link JsonObject } the query
     * @param lowestRight {@link String} the lowest right to give permit to the action
     */
    public static void checkFolderShareRightsQuery(UserInfos user, String folderId, JsonObject query, String lowestRight) {
        query.put(Mongo.AND, new JsonArray()
                .add(new JsonObject().put(Field._ID, folderId))
                .add(new JsonObject().put(Mongo.OR, new JsonArray()
                        .add(new JsonObject().put(Field.OWNERID, user.getUserId())) //is folder owner
                        .add(new JsonObject() //folder shared to user with right
                                .put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                                        .put(Field.USERID, user.getUserId())
                                        .put(lowestRight, true)
                                )))
                        .add(new JsonObject() //folder shared to group with right
                                .put(Field.SHARED, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                                        .put(Field.GROUPID, new JsonObject().put(Mongo.IN, user.getGroupsIds()))
                                        .put(lowestRight, true)
                                )))
                ))
        );
    }


}
