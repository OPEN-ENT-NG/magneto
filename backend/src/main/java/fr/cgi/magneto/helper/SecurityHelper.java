package fr.cgi.magneto.helper;

import io.vertx.core.http.HttpServerResponse;

import java.util.List;

public class SecurityHelper {

    public static void setIframeSecurityHeaders(HttpServerResponse response, List<String> allowedOrigins) {
        response.putHeader("Content-Security-Policy",
                        "frame-ancestors self " + String.join(" ", allowedOrigins))
                .putHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    }
}