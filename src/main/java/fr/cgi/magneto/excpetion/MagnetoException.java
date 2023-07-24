package fr.cgi.magneto.excpetion;

import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonObject;

public interface MagnetoException {
    JsonObject getMessageResult();

    int getStatus();
}
