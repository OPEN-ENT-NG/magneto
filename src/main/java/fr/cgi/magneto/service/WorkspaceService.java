package fr.cgi.magneto.service;

import io.vertx.core.Future;
import io.vertx.core.json.*;

import java.util.*;

public interface WorkspaceService {

    /**
     * Get document by identifier
     *
     * @param documentId Document identifier
     * @return Future {@link Future <JsonObject>} containing metadata of the document
     */
    Future<JsonObject> getDocument(String documentId);

    Future<Boolean> canEditDocument(String userId, String documentId);

    Future<JsonObject> setShareRights(List<String> documentIds, JsonArray shareRights);
}
