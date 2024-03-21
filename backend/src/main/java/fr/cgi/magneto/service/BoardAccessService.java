package fr.cgi.magneto.service;

import io.vertx.core.Future;

import java.util.List;

public interface BoardAccessService {
    /**
     * insert a line each time a user access a board
     * @param boardsIds
     * @param userId
     * @return
     */
    Future<Void> insertAccess(List<String> boardsIds, String userId);

    /**
     * get the 5 last boards accessed within a month
     * @param userId
     * @return
     */
    Future<List<String>> getLastAccess(String userId);
}
