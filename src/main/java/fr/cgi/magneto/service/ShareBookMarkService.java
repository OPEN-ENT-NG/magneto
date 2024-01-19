package fr.cgi.magneto.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface ShareBookMarkService {
    Future<JsonObject> get(String userId, String id);
}