package fr.cgi.magneto.helper;

import fr.cgi.magneto.excpetion.MagnetoException;
import fr.wseduc.webutils.http.Renders;
import io.vertx.core.http.HttpServerRequest;

public class HttpRequestHelper {

    private HttpRequestHelper() {
        throw new IllegalStateException("Utility class");
    }

    public static void sendError(HttpServerRequest request, Throwable fail) {
        if (fail instanceof MagnetoException) {
            MagnetoException magnetoException = (MagnetoException) fail;
            Renders.renderJson(request, magnetoException.getMessageResult(), magnetoException.getStatus());
        } else {
            Renders.renderError(request);
        }
    }
}
