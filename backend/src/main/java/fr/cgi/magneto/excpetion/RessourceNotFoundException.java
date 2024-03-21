package fr.cgi.magneto.excpetion;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonObject;

public class RessourceNotFoundException extends Throwable implements MagnetoException {

    public RessourceNotFoundException(String message) {
        super(message);
    }

    @Override
    public JsonObject getMessageResult() {
        return new JsonObject().put(Field.MESSAGE, super.getMessage());
    }

    @Override
    public int getStatus() {
        return 404;
    }
}
