package fr.cgi.magneto.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface ShareService {
    Future<JsonObject> upsertSharedArray(String id, JsonObject share, String collection);
}
