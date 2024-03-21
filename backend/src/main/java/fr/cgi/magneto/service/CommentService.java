package fr.cgi.magneto.service;

import fr.cgi.magneto.model.comments.*;
import io.vertx.core.*;
import io.vertx.core.json.*;

import java.util.List;

public interface CommentService {

    /**
     * Get all comments of a card
     * @param cardId
     * @param page
     * @return Future {@link Future <List <Comment>>} containing list of comments
     */
    Future<List<Comment>> getAllComments(String cardId, Integer page);

    /**
     * Get comments count
     * @param cardId Card identifier
     * @return Future {@link Future <JsonObject>} containing comments count
     */
    Future<Integer> getCommentsCount(String cardId);

    /**
     * Create a comment
     * @param comment Comment to create {@link CommentPayload}
     * @param cardId Card identifier
     * @return Future {@link Future <JsonObject>} containing newly created comment
     */
    Future<CommentPayload> createComment(CommentPayload comment, String cardId);

    /**
     * Update a comment
     * @param comment  Comment to update {@link CommentPayload}
     * @param cardId Card identifier
     * @return Future {@link Future <JsonObject>} containing updated comment
     */
    Future<CommentPayload> updateComment(CommentPayload comment, String cardId);

    /**
     * Delete a comment
     * @param userId User identifier
     * @param cardId Card identifier
     * @param commentId Comment identifier
     * @return Future {@link Future <JsonObject>} containing response
     */
    Future<Void> deleteComment(String userId, String cardId, String commentId);

}
