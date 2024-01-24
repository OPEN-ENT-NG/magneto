package fr.cgi.magneto.helper;

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
     *
     * @param elems
     * @param elems2
     * @return
     */
    public static List<SharedElem> removeCommonRights(List<SharedElem> elems, List<SharedElem> elems2){
        return elems.stream().filter(elem -> elems2.stream().noneMatch(elem::hasSameId)).collect(Collectors.toList());
    }

}
