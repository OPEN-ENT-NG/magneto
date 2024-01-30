package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.model.share.SharedElem;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

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
}
