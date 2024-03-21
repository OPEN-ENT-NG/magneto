package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.security.*;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.CardService;
import fr.cgi.magneto.service.SectionService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.user.UserUtils;

import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.enums.Events.CREATE;

public class SectionController extends ControllerHelper {
    private final EventStore eventStore;
    private final SectionService sectionService;
    private final BoardService boardService;
    private final CardService cardService;


    public SectionController(ServiceFactory serviceFactory) {
        this.sectionService = serviceFactory.sectionService();
        this.boardService = serviceFactory.boardService();
        this.cardService = serviceFactory.cardService();
        this.eventStore = EventStoreFactory.getFactory().getEventStore(Magneto.class.getSimpleName());
    }

    @Get("/sections/:id")
    @ApiDoc("Get sections by board id")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getSectionsByBoardId(HttpServerRequest request) {
        String boardId = request.getParam(Field.ID);
        UserUtils.getUserInfos(eb, request, user -> new ContribBoardRight().authorize(request, null, user, readOnly ->
                boardService.getBoards(Collections.singletonList(boardId))
                .compose(boards -> {
                    if (boards.isEmpty()) {
                        String message = String.format("[Magneto@%s::getSectionsByBoardId] Failed to get boards with board id : %s",
                                this.getClass().getSimpleName(), boardId);
                        return Future.failedFuture(message);
                    } else {

                        return sectionService.getSectionsByBoard(boards.get(0), !readOnly);
                    }
                })
                .onFailure(err -> {
                    String message = String.format("[Magneto@%s::getSectionsByBoardId] Failed to get all sections by board id : %s",
                            this.getClass().getSimpleName(), err.getMessage());
                    log.error(message);
                    renderError(request);
                })
                .onSuccess(result -> {
                    JsonArray sectionsResult = new JsonArray(result
                            .stream()
                            .map(Section::toJson)
                            .collect(Collectors.toList()));
                    renderJson(request, new JsonObject()
                            .put(Field.ALL, sectionsResult));
                })));
    }

    @Post("/section")
    @ApiDoc("Create a section")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "section", section -> {
            UserUtils.getUserInfos(eb, request, user -> {
                SectionPayload createSection = new SectionPayload(section);
                String newId = UUID.randomUUID().toString();

                Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(createSection.getBoardId()));
                Future<JsonObject> createSectionFuture = sectionService.create(createSection, newId);
                CompositeFuture.all(getBoardFuture, createSectionFuture)
                        .compose(result -> {
                            if (!getBoardFuture.result().isEmpty() && result.succeeded()) {
                                BoardPayload boardPayload = new BoardPayload(getBoardFuture.result().get(0).toJson());
                                boardPayload.addSection(newId);
                                return boardService.update(boardPayload);
                            } else {
                                return Future.failedFuture(String.format("[Magneto%s::createSection] " +
                                        "No board found with id %s", this.getClass().getSimpleName(), createSection.getBoardId()));
                            }
                        })
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::createSection] Failed to create section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                            renderError(request);
                        })
                        .onSuccess(result -> {
                            eventStore.createAndStoreEvent(CREATE.name(), user, new JsonObject()
                                    .put(Field.RESOURCE_DASH_TYPE, Field.RESOURCE_SECTION));
                            renderJson(request, createSectionFuture.result());
                        });
            });
        });
    }

    @Put("/section")
    @ApiDoc("Update a section")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updateSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "sectionUpdate", section -> {
            UserUtils.getUserInfos(eb, request, user -> {
                SectionPayload updateSection = new SectionPayload(section)
                        .setId(section.getString(Field.ID));
                sectionService.update(updateSection)
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateSection] Failed to update section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                            renderError(request);
                        })
                        .onSuccess(result -> renderJson(request, result));
            });
        });
    }


    @Delete("/sections")
    @ApiDoc("Delete sections")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void deleteSections(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteSections", sections -> {
            List<String> sectionIds = sections.getJsonArray(Field.SECTIONIDS).getList();
            String boardId = sections.getString(Field.BOARDID);
            Boolean deleteCards = sections.getBoolean(Field.DELETECARDS);
            sectionService.deleteSections(sectionIds, boardId, deleteCards)
                    .onFailure(err -> {
                        String message = String.format("[Magneto@%s::deleteSections] Failed to delete sections : %s",
                                this.getClass().getSimpleName(), err.getMessage());
                        log.error(message);
                        renderError(request);
                    })
                    .onSuccess(res -> renderJson(request, res));
        });
    }

    @Post("/section/duplicate")
    @ApiDoc("Duplicate a section")
    @ResourceFilter(DuplicateCardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void duplicateSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "sectionDuplicate", sectionDuplicate -> {
            UserUtils.getUserInfos(eb, request, user -> {
                List<String> sectionIds = sectionDuplicate.getJsonArray(Field.SECTIONIDS, new JsonArray()).getList();
                String boardId = sectionDuplicate.getString(Field.BOARDID);
                Future<JsonObject> getCardsFuture = cardService.getAllCardsByBoard(new Board(new JsonObject()).setId(boardId), null, user, false);
                Future<List<Section>> getSectionsFuture = sectionService.get(sectionIds);
                CompositeFuture.all(getCardsFuture, getSectionsFuture)
                        .compose(sections -> {
                            List<Section> duplicateSections = getSectionsFuture.result();
                            JsonArray duplicateCardsArray = getCardsFuture.result().getJsonArray(Field.ALL);
                            List<Card> duplicateCards = duplicateCardsArray.getList();
                            return sectionService.duplicateSections(boardId, duplicateSections, duplicateCards, false, user);
                        })
                        .onSuccess(res -> {
                            eventStore.createAndStoreEvent(CREATE.name(), user, new JsonObject()
                                    .put(Field.RESOURCE_DASH_TYPE, Field.RESOURCE_SECTION));
                            renderJson(request, res);
                        })
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::duplicateSection] Failed to duplicate section : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                            renderError(request);
                        });
            });
        });
    }

}
