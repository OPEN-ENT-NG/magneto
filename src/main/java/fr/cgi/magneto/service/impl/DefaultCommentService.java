package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.*;
import fr.cgi.magneto.model.comments.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.mongodb.*;
import io.vertx.core.*;
import io.vertx.core.json.*;
import io.vertx.core.logging.*;
import org.entcore.common.mongodb.*;

import java.util.*;

public class DefaultCommentService implements CommentService {

    private final MongoDb mongoDb;

    private final String collection;

    protected static final Logger log = LoggerFactory.getLogger(DefaultCommentService.class);

    public DefaultCommentService(String collection, MongoDb mongoDb) {
        this.mongoDb = mongoDb;
        this.collection = collection;
    }

    @Override
    public Future<List<Comment>> getAllComments(String cardId, Integer page) {
        Promise<List<Comment>> promise = Promise.promise();

        JsonObject query = this.getAllCommentsQuery(cardId, page);

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getAllComments] Failed to get all comments", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            JsonArray result = results.right().getValue()
                    .getJsonObject(Field.CURSOR, new JsonObject())
                    .getJsonArray(Field.FIRSTBATCH, new JsonArray());

            promise.complete(ModelHelper.toList(result, Comment.class));
        }));

        return promise.future();
    }

    @Override
    public Future<CommentPayload> createComment(CommentPayload comment, String cardId) {
        Promise<CommentPayload> promise = Promise.promise();
        String newId = UUID.randomUUID().toString();

        JsonObject query = new JsonObject()
                .put(Field._ID, cardId);

        JsonObject update = new JsonObject()
                .put(Mongo.PUSH, new JsonObject()
                        .put(Field.COMMENTS, new JsonObject()
                                .put(Field._ID, newId)
                                .put(Field.OWNERID, comment.getOwnerId())
                                .put(Field.OWNERNAME, comment.getOwnerName())
                                .put(Field.CONTENT, comment.getContent())
                                .put(Field.CREATIONDATE, comment.getCreationDate())
                                .put(Field.MODIFICATIONDATE, comment.getModificationDate())
                        )
                );

        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::createComment] Failed to create comment", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(comment.setId(newId));
        }));
        return promise.future();
    }

    private JsonObject getAllCommentsQuery(String cardId, Integer page) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field._ID, cardId))
                .unwind(Field.COMMENTS, false)
                .project(new JsonObject()
                        .put(Field._ID, String.format("$%s.%s", Field.COMMENTS, Field._ID))
                        .put(Field.OWNERID, String.format("$%s.%s", Field.COMMENTS, Field.OWNERID))
                        .put(Field.OWNERNAME, String.format("$%s.%s", Field.COMMENTS, Field.OWNERNAME))
                        .put(Field.CONTENT, String.format("$%s.%s", Field.COMMENTS, Field.CONTENT))
                        .put(Field.CREATIONDATE, String.format("$%s.%s", Field.COMMENTS, Field.CREATIONDATE))
                        .put(Field.MODIFICATIONDATE, String.format("$%s.%s", Field.COMMENTS, Field.MODIFICATIONDATE))
                )
                .page(page);

        return query.getAggregate();
    }

    @Override
    public Future<CommentPayload> updateComment(CommentPayload comment, String cardId) {
        Promise<CommentPayload> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, cardId)
                .put(Field.COMMENTS, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject()
                        .put(Field._ID, comment.getId())
                        .put(Field.OWNERID, comment.getOwnerId())));

        JsonObject update = new JsonObject()
                .put(Mongo.SET, new JsonObject()
                        .put(String.format("%s.$.%s", Field.COMMENTS, Field.CONTENT), comment.getContent())
                        .put(String.format("%s.$.%s", Field.COMMENTS, Field.MODIFICATIONDATE), comment.getModificationDate())
                );

        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateComment] Failed to update comment", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(comment);
        }));
        return promise.future();
    }


    @Override
    public Future<Integer> getCommentsCount(String cardId) {
        Promise<Integer> promise = Promise.promise();

       MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field._ID, cardId))
                .unwind(Field.COMMENTS, false)
                .count();

        mongoDb.command(query.getAggregate().toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getCommentsCount] Failed to get comments count", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonArray countArray = results.right().getValue().getJsonObject(Field.CURSOR, new JsonObject())
                    .getJsonArray(Field.FIRSTBATCH, new JsonArray());

            promise.complete(countArray.isEmpty() ? 0 : countArray.getJsonObject(0).getInteger(Field.COUNT));

        }));

        return promise.future();

    }

    @Override
    public Future<Void> deleteComment(String userId, String cardId, String commentId) {
        Promise<Void> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, cardId);

        JsonObject update = new JsonObject()
                .put(Mongo.PULL, new JsonObject()
                        .put(Field.COMMENTS, new JsonObject()
                                .put(Field._ID, commentId)
                                .put(Field.OWNERID, userId)
                        )
                );

        mongoDb.update(this.collection, query, update, MongoDbResult.validActionResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::deleteComment] Failed to delete comment", this.getClass().getSimpleName());

                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
        return promise.future();
    }

}
