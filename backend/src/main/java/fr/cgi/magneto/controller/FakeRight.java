package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Rights;
import fr.wseduc.rs.Get;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import org.entcore.common.controller.ControllerHelper;

public class FakeRight extends ControllerHelper {
    public FakeRight() {
        super();
    }

    private void notImplemented(HttpServerRequest request) {
        request.response().setStatusCode(501).end();
    }

    @Get("/rights/board/manage")
    @SecuredAction(Rights.MANAGE_BOARD)
    public void boardManage(HttpServerRequest request) {
        notImplemented(request);
    }

    @Get("/rights/board/publish")
    @SecuredAction(Rights.PUBLISH_BOARD)
    public void boardPublish(HttpServerRequest request) {
        notImplemented(request);
    }

    @Get("/rights/board/comment")
    @SecuredAction(Rights.COMMENT_BOARD)
    public void boardComment(HttpServerRequest request) {
        notImplemented(request);
    }

    @Get("/rights/board/favorites")
    @SecuredAction(Rights.DISPLAY_NB_FAVORITES)
    public void boardFavorites(HttpServerRequest request) {
        notImplemented(request);
    }

    @Get("/rights/board/public")
    @SecuredAction(Rights.MAKE_BOARD_PUBLIC)
    public void boardPublic(HttpServerRequest request) {
        notImplemented(request);
    }

    @Get("/rights/board/synchronous")
    @SecuredAction(Rights.SYNCHRONOUS_MODE)
    public void boardSynchronous(HttpServerRequest request) {
        notImplemented(request);
    }
}
