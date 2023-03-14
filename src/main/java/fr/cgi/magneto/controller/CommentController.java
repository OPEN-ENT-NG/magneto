package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.model.comments.*;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.*;
import fr.wseduc.webutils.request.*;
import io.vertx.core.*;
import io.vertx.core.http.*;
import io.vertx.core.json.*;
import org.entcore.common.controller.*;
import org.entcore.common.user.*;

import java.util.*;
import java.util.stream.*;

public class CommentController extends ControllerHelper {

    private final CommentService commentService;

    public CommentController(ServiceFactory serviceFactory) {
        this.commentService = serviceFactory.commentService();
    }

    @Get("/card/:cardId/comments")
    @ApiDoc("Get all comments of a card")
    //TODO droits MAG-170
    public void getAllComments(HttpServerRequest request) {
        String cardId = request.getParam(Field.CARDID);

        try {
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            Future<List<Comment>> getCommentsFuture = this.commentService.getAllComments(cardId, page);
            Future<Integer> getCommentsCountFuture = this.commentService.getCommentsCount(cardId);

            CompositeFuture.all(getCommentsFuture, getCommentsCountFuture)
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllComments] Failed to get all comments",
                                this.getClass().getSimpleName());
                        log.error(message);
                        renderError(request);
                    })
                    .onSuccess(result -> {
                        JsonArray commentsResult = new JsonArray(getCommentsFuture.result()
                                .stream()
                                .map(Comment::toJson)
                                .collect(Collectors.toList()));
                        JsonObject response = new JsonObject()
                                .put(Field.ALL, commentsResult)
                                .put(Field.COUNT, getCommentsCountFuture.result());
                        renderJson(request, response);
                    });
        } catch (NumberFormatException e) {
            String message = String.format("[Magneto@%s::getAllComments] Failed to parse page parameter",
                    this.getClass().getSimpleName());
            log.error(message, e);
            renderError(request);
        }
    }

    @Post("/card/:cardId/comment")
    @ApiDoc("Create a comment")
    //TODO droits MAG-170
    public void addComment(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "comment", body ->
                UserUtils.getUserInfos(eb, request, user -> {
                    CommentPayload commentPayload = new CommentPayload(body)
                            .setOwnerId(user.getUserId())
                            .setOwnerName(user.getUsername());

                    String cardId = request.getParam(Field.CARDID);

                    this.commentService.createComment(commentPayload, cardId)
                            .onSuccess(result -> renderJson(request, result.toJson()))
                            .onFailure(fail -> {
                                String message = String.format("[Magneto@%s::addComment] Failed to create comment",
                                        this.getClass().getSimpleName());
                                log.error(message);
                                renderError(request);
                            });
                })
        );
    }

    @Put("/card/:cardId/comment/:commentId")
    @ApiDoc("Update a comment")
    //TODO droits MAG-170
    public void updateComment(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "commentUpdate", body ->
        UserUtils.getUserInfos(eb, request, user -> {
            String cardId = request.getParam(Field.CARDID);
            String commentId = request.getParam(Field.COMMENTID);
            String content = body.getString(Field.CONTENT);

            this.commentService.updateComment(new CommentPayload(user, commentId, content), cardId)
                    .onSuccess(result -> renderJson(request, result.toJson()))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::updateComment] Failed to update comment",
                                this.getClass().getSimpleName());
                        log.error(message);
                        renderError(request);
                    });
        })
        );
    }

    @Delete("/card/:cardId/comment/:commentId")
    @ApiDoc("Delete a comment")
    //TODO droits MAG-170
    public void deleteComment(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String cardId = request.getParam(Field.CARDID);
            String commentId = request.getParam(Field.COMMENTID);
            String userId = user.getUserId();

            this.commentService.deleteComment(userId, cardId, commentId)
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::deleteComment] Failed to delete comment",
                                this.getClass().getSimpleName());
                        log.error(message);
                        renderError(request);
                    })
                    .onSuccess(result -> renderJson(request, new JsonObject().put(Field._ID, commentId)));
        });
    }
}
