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

}
