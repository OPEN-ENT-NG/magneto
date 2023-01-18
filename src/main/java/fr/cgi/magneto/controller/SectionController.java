package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Actions;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.security.DuplicateCardRight;
import fr.cgi.magneto.security.MoveBoardRight;
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
import org.entcore.common.http.filter.Trace;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.enums.Events.CREATE_SECTION;

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

    @Get("/sections/:boardId")
    @ApiDoc("Get sections by board id")
    @ResourceFilter(MoveBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getSectionsByBoardId(HttpServerRequest request) {
        String boardId = request.getParam(Field.BOARDID);
        sectionService.getSectionsByBoardId(boardId)
                .onFailure(err -> renderError(request))
                .onSuccess(result -> {
                    JsonArray sectionsResult = new JsonArray(result
                            .stream()
                            .map(Section::toJson)
                            .collect(Collectors.toList()));
                    renderJson(request, new JsonObject()
                            .put(Field.ALL, sectionsResult));
                });
    }

    @Post("/section")
    @ApiDoc("Create a section")
    @ResourceFilter(MoveBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void createSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "section", section -> {
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
                    .onFailure(err -> renderError(request))
                    .onSuccess(result -> {
                        eventStore.createAndStoreEvent(CREATE_SECTION.name(), request);
                        renderJson(request, result);
                    });
        });
    }

    @Post("/section/move/cards")
    @ApiDoc("Move card from a section to another")
    @ResourceFilter(MoveBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void moveCardsSection(HttpServerRequest request) {
    }

    @Put("/section")
    @ApiDoc("Update a section")
    @ResourceFilter(MoveBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void updateSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "sectionUpdate", section -> {
            UserUtils.getUserInfos(eb, request, user -> {
                SectionPayload updateSection = new SectionPayload(section)
                        .setId(section.getString(Field.ID));
                sectionService.update(updateSection)
                        .onFailure(err -> renderError(request))
                        .onSuccess(result -> renderJson(request, result));
            });
        });
    }


    @Delete("/sections")
    @ApiDoc("Delete sections")
    @ResourceFilter(MoveBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @SuppressWarnings("unchecked")
    public void deleteSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "deleteSections", sections -> {
            List<String> sectionIds = sections.getJsonArray(Field.SECTIONIDS).getList();
            String boardId = sections.getString(Field.BOARDID);
            Boolean deleteCards = sections.getBoolean(Field.DELETECARDS);
            List<Future> removeSectionsFuture = new ArrayList<>();
            Future<List<Section>> getSectionsFuture = sectionService.getSectionsByBoardId(boardId);
            Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(boardId));
            CompositeFuture.all(getBoardFuture, getSectionsFuture)
                    .compose(result -> {
                        if (!getBoardFuture.result().isEmpty() && !getSectionsFuture.result().isEmpty() && result.succeeded()) {
                            Board currentBoard = getBoardFuture.result().get(0);
                            currentBoard.setSections(getSectionsFuture.result());
                            BoardPayload boardToUpdate = new BoardPayload()
                                    .setId(currentBoard.getId())
                                    .setSectionIds(currentBoard.sections()
                                            .stream()
                                            .map(Section::getId)
                                            .collect(Collectors.toList())).removeSectionIds(sectionIds)
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            if (deleteCards) {
                                removeSectionsFuture.add(cardService.deleteCards(currentBoard.getCardsBySection(sectionIds)));
                            } else {
                                Section firstSection = currentBoard.sections()
                                        .stream()
                                        .filter(section -> !sectionIds.contains(section.getId()))
                                        .findFirst()
                                        .orElse(null);
                                if (firstSection != null) {
                                    SectionPayload sectionToUpdate = new SectionPayload(firstSection.toJson())
                                            .addCardIds(currentBoard.getCardsBySection(sectionIds));
                                    removeSectionsFuture.add(sectionService.update(sectionToUpdate));
                                } else {
                                    removeSectionsFuture.add(Future.failedFuture(String.format("[Magneto%s::deleteSection] " +
                                            "No section is available to move cards inside", this.getClass().getSimpleName())));
                                }
                            }
                            removeSectionsFuture.add(boardService.update(boardToUpdate));
                            removeSectionsFuture.add(sectionService.delete(sectionIds));
                            return CompositeFuture.all(removeSectionsFuture);
                        } else {
                            return Future.failedFuture(String.format("[Magneto%s::deleteCards] " +
                                    "No board found with id %s", this.getClass().getSimpleName(), boardId));
                        }
                    })
                    .onFailure(err -> renderError(request))
                    .onSuccess(result -> renderJson(request, new JsonObject()));
        });
    }

    @Post("/section/duplicate")
    @ApiDoc("Duplicate a section")
    @ResourceFilter(DuplicateCardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.SECTION_CREATION)
    @SuppressWarnings("unchecked")
    public void duplicateSection(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "sectionDuplicate", sectionDuplicate -> {
            UserUtils.getUserInfos(eb, request, user -> {
                List<String> sectionIds = sectionDuplicate.getJsonArray(Field.SECTIONIDS, new JsonArray()).getList();
                String boardId = sectionDuplicate.getString(Field.BOARDID);
                Future<JsonObject> getCardsFuture = cardService.getAllCardsByBoard(new Board(new JsonObject()).setId(boardId), null);
                Future<List<Section>> getSectionsFuture = sectionService.get(sectionIds);
                CompositeFuture.all(getCardsFuture, getSectionsFuture)
                        .compose(sections -> {
                            List<Section> duplicateSections = getSectionsFuture.result();
                            JsonArray duplicateCardsArray = getCardsFuture.result().getJsonArray(Field.ALL);
                            List<Card> duplicateCards = duplicateCardsArray.getList();
                            return sectionService.duplicateSections(boardId, duplicateSections, duplicateCards, false, user);
                        })
                        .onSuccess(res -> {
                            eventStore.createAndStoreEvent(CREATE_SECTION.name(), request);
                            renderJson(request, res);
                        })
                        .onFailure(err -> renderError(request));
            });
        });
    }

}
