package fr.cgi.magneto.helper;

import io.vertx.core.http.HttpServerResponse;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

public class SecurityHelper {

    /**
     * Vérifie si l'origine de la requête est autorisée à intégrer le contenu dans une iframe.
     * Permet de valider l'origine avec une whitelist pour prévenir les attaques de type
     * clickjacking, phishing et embedding non autorisé.
     *
     * @param origin header Origin
     * @param referer header Referer
     * @param allowedOrigins whitelist
     * @return true si l'origine est OK, false sinon
     *
     * @throws IllegalArgumentException si la whitelist est null
     *
     */
    public static boolean isOriginAllowed(String origin, String referer, List<String> allowedOrigins) {
        if (allowedOrigins == null) {
            throw new IllegalArgumentException("allowedOrigins cannot be null");
        }

        String sourceUrl = origin != null ? origin : extractOriginFromReferer(referer);

        if (sourceUrl == null) {
            return false;
        }

        // Validation stricte avec normalisation pour éviter les contournements
        try {
            URI sourceUri = new URI(sourceUrl);
            String normalizedOrigin = sourceUri.getScheme() + "://" + sourceUri.getAuthority();
            return allowedOrigins.contains(normalizedOrigin);
        } catch (URISyntaxException e) {
            return false;
        }
    }

    /**
     * Extrait l'origine (scheme + authority) depuis l'header Referer.
     * Utilisée comme fallback quand l'header Origin n'est pas disponible.
     *
     * @param referer header Referer
     * @return l'origine extraite au bon format "https://domain.com" (ou null si impossible)
     *
     */
    private static String extractOriginFromReferer(String referer) {
        if (referer == null || referer.trim().isEmpty()) {
            return null;
        }

        try {
            URI refererUri = new URI(referer);
            return refererUri.getScheme() + "://" + refererUri.getAuthority();
        } catch (URISyntaxException e) {
            return null;
        }
    }

    public static void setIframeSecurityHeaders(HttpServerResponse response, List<String> allowedOrigins) {
        response.putHeader("Content-Security-Policy",
                        "frame-ancestors " + String.join(" ", allowedOrigins))
                .putHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    }
}