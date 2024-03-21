package fr.cgi.magneto.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonArray;

import java.util.List;

public interface UserService {

    /**
     * Get all boards by creation date
     *
     * @param userIds User's identifiers
     * @return Future {@link Future JsonArray} containing users filtered by ids
     */
    Future<JsonArray> getUsersByIds(List<String> userIds);

}
