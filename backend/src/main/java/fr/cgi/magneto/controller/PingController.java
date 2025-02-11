package fr.cgi.magneto.controller;

import fr.cgi.magneto.model.slide.SlideResource;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.SlideMappingService;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.collections.JsonArray;
import fr.wseduc.webutils.collections.JsonObject;
import io.vertx.core.http.HttpServerRequest;

import java.util.stream.Collectors;

import org.entcore.common.controller.ControllerHelper;

@SuppressWarnings("deprecation")
public class PingController extends ControllerHelper {

        private final SlideMappingService slideMappingService;

        public PingController(ServiceFactory serviceFactory) {
                this.slideMappingService = serviceFactory.slideMappingService();
        }

        @Get("/ping/:boardId")
        @ApiDoc("Test slides mapping for a board")
        @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
        public void getSlideMapping(HttpServerRequest request) {
                String boardId = request.getParam("boardId");
                System.out.println("Received boardId: " + boardId); // Log du boardId

                slideMappingService.generateSlideMapping(boardId)
                                .onSuccess(slides -> {
                                        System.out.println("Slides generated successfully");
                                        System.out.println("Slides count: " + slides.size());
                                        renderJson(request, new JsonObject()
                                                        .put("status", "ok")
                                                        .put("slides", new JsonArray(slides.stream()
                                                                        .map(SlideResource::toJson)
                                                                        .collect(Collectors.toList()))));
                                })
                                .onFailure(err -> {
                                        System.err.println("Error in getSlideMapping:");
                                        err.printStackTrace(); // Imprime la stack trace complète

                                        log.error(String.format(
                                                        "[Magneto@%s::getSlideMapping] Failed to get slide mapping : %s",
                                                        this.getClass().getSimpleName(), err.getMessage()), err);

                                        // Ajoutez plus de détails dans la réponse
                                        renderJson(request, new JsonObject()
                                                        .put("status", "error")
                                                        .put("message", err.getMessage()));
                                });
        }
}