package fr.cgi.magneto.controller;

import fr.cgi.magneto.Magneto;
import fr.cgi.magneto.core.constants.Actions;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.excpetion.BadRequestException;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.HttpRequestHelper;
import fr.cgi.magneto.helper.I18nHelper;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.security.DuplicateCardRight;
import fr.cgi.magneto.security.ReadBoardRight;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.security.WriteBoardRight;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.CardService;
import fr.cgi.magneto.service.SectionService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.I18n;
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

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static fr.cgi.magneto.core.enums.Events.CREATE;

public class CardController extends ControllerHelper {

    private final EventStore eventStore;
    private final CardService cardService;
    private final BoardService boardService;
    private final SectionService sectionService;


    public CardController(ServiceFactory serviceFactory) {
        this.cardService = serviceFactory.cardService();
        this.boardService = serviceFactory.boardService();
        this.sectionService = serviceFactory.sectionService();
        this.eventStore = EventStoreFactory.getFactory().getEventStore(Magneto.class.getSimpleName());
    }

    @Get("/cards/collection")
    @ApiDoc("Get all cards collection")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCardsCollection(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String searchText = (request.getParam(Field.SEARCHTEXT) != null) ?
                    request.getParam(Field.SEARCHTEXT) : "";
            String sortBy = request.getParam(Field.SORTBY);
            String boardId = request.getParam(Field.BOARDID);
            boolean isPublic = Boolean.parseBoolean(request.getParam(Field.ISPUBLIC));
            boolean isShared = Boolean.parseBoolean(request.getParam(Field.ISSHARED));
            boolean isFavorite = Boolean.parseBoolean(request.getParam(Field.ISFAVORITE));
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            cardService.getAllCards(user, boardId, page, isPublic, isShared, isFavorite, searchText, sortBy)
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllCards] Failed to get all cards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Get("/cards/:boardId")
    @ApiDoc("Get all cards by board id")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCardsByBoardId(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String boardId = request.getParam(Field.BOARDID);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            boolean fromStartPage = request.getParam(Field.FROMSTARTPAGE) != null ? Boolean.parseBoolean(request.getParam(Field.FROMSTARTPAGE)) : false;
            boardService.getBoards(Collections.singletonList(boardId))
                    .compose(board -> cardService.getAllCardsByBoard(board.get(0), page, user, fromStartPage))
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllCardsByBoardId] Failed to get all cards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Get("/public/cards/:boardId")
    @ApiDoc("Get all cards by board id")
    public void getAllCardsByBoardIdPublic(HttpServerRequest request) {
        String boardId = request.getParam(Field.BOARDID);
        Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
        boolean fromStartPage = request.getParam(Field.FROMSTARTPAGE) != null ? Boolean.parseBoolean(request.getParam(Field.FROMSTARTPAGE)) : false;
        boardService.getBoards(Collections.singletonList(boardId))
                .compose(board -> cardService.getAllCardsByBoard(board.get(0), page, null, fromStartPage))
                .onSuccess(result -> renderJson(request, result))
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::getAllCardsByBoardId] Failed to get all cards : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    log.error(message);
                    renderError(request);
                });
    }

    @Get("/cards/section/:sectionId")
    @ApiDoc("Get all cards by section id")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getAllCardsBySectionId(HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, user -> {
            String sectionId = request.getParam(Field.SECTIONID);
            Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
            sectionService.get(Collections.singletonList(sectionId))
                    .compose(sections -> cardService.getAllCardsBySection(sections.get(0), page, user))
                    .onSuccess(result -> renderJson(request, result))
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getAllCardsBySectionId] Failed to get all cards : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Get("/public/cards/section/:sectionId")
    @ApiDoc("Get all cards by section id")
    public void getAllCardsBySectionIdPublic(HttpServerRequest request) {
        String sectionId = request.getParam(Field.SECTIONID);
        Integer page = request.getParam(Field.PAGE) != null ? Integer.parseInt(request.getParam(Field.PAGE)) : null;
        sectionService.get(Collections.singletonList(sectionId))
                .compose(sections -> cardService.getAllCardsBySection(sections.get(0), page, null))
                .onSuccess(result -> renderJson(request, result))
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::getAllCardsBySectionId] Failed to get all cards : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    log.error(message);
                    renderError(request);
                });
    }

    @Get("/card/:id")
    @ApiDoc("Get card by id")
    @ResourceFilter(ViewRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getCard(HttpServerRequest request) {
        String cardId = request.getParam(Field.ID);
        UserUtils.getUserInfos(eb, request, user -> {
            cardService.getCards(Collections.singletonList(cardId), user)
                    .onSuccess(result -> {
                        renderJson(request, !result.isEmpty() ? result.get(0).toJson() : new JsonObject());
                    })
                    .onFailure(fail -> {
                        String message = String.format("[Magneto@%s::getCard] Failed to get card by id : %s",
                                this.getClass().getSimpleName(), fail.getMessage());
                        log.error(message);
                        renderError(request);
                    });
        });
    }

    @Post("/card")
    @ApiDoc("Create a card")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_CREATION)
    public void createCard(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "card", body ->
                UserUtils.getUserInfos(eb, request, user -> {
                    CardPayload cardPayload = new CardPayload(body)
                            .setOwnerId(user.getUserId())
                            .setOwnerName(user.getUsername());
                    I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
                    this.cardService.createCardLayout(cardPayload, i18nHelper, user)
                            .onFailure(err -> renderError(request))
                            .onSuccess(result -> {
                                eventStore.createAndStoreEvent(CREATE.name(), user, new JsonObject()
                                        .put(Field.RESOURCE_DASH_TYPE, Field.RESOURCE_MAGNET));
                                renderJson(request, result);
                            });
                }));
    }

    @Put("/card")
    @ApiDoc("Update a card")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_UPDATE)
    public void update(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardUpdate", card -> {
            UserUtils.getUserInfos(eb, request, user -> {
                CardPayload updateCard = new CardPayload(card)
                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT))
                        .setLastModifierId(user.getUserId())
                        .setLastModifierName(user.getUsername());
                Future<JsonObject> updateCardFuture = cardService.update(updateCard);
                Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(updateCard.getBoardId()));
                CompositeFuture.all(updateCardFuture, getBoardFuture)
                        .compose(result -> {
                            Board currentBoard = getBoardFuture.result().get(0);
                            BoardPayload boardToUpdate = new BoardPayload()
                                    .setId(currentBoard.getId())
                                    .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
                            return boardService.update(boardToUpdate);
                        })
                        .onFailure(err -> renderError(request))
                        .onSuccess(res -> renderJson(request, res));
            });
        });
    }
    @Put("/card/:id/favorite")
    @ApiDoc("Update the favorites of a card")
    @ResourceFilter(ReadBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.FAVORITE_UPDATE)
    public void updateFavorite(HttpServerRequest request){
        RequestUtils.bodyToJson(request, pathPrefix + "cardUpdateFavorite", body -> {
            UserUtils.getUserInfos(eb, request, user -> {
                String cardId = request.getParam(Field.ID);
                boolean favorite = body.getBoolean(Field.ISFAVORITE);
                if(user == null){
                    BadRequestException noUser = new BadRequestException("User not found");
                    String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                            this.getClass().getSimpleName(), noUser.getMessage());
                    log.error(message);
                    HttpRequestHelper.sendError(request, new BadRequestException("User not found"));
                }
                cardService.updateFavorite(cardId, favorite, user)
                        .onSuccess(res -> renderJson(request, res))
                        .onFailure(err -> {
                            String message = String.format("[Magneto@%s::updateFavorite] Failed to update favorite state : %s",
                                    this.getClass().getSimpleName(), err.getMessage());
                            log.error(message);
                            HttpRequestHelper.sendError(request, err);
                        });
            });
        });
    }


    @SuppressWarnings("unchecked")
    @Post("/card/duplicate")
    @ApiDoc("Duplicate a card")
    @ResourceFilter(DuplicateCardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_CREATION)
    public void duplicate(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardDuplicate", duplicateCard -> {
            UserUtils.getUserInfos(eb, request, user -> {
                List<String> cardIds = duplicateCard.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
                String boardId = duplicateCard.getString(Field.BOARDID);
                cardService.getCards(cardIds, user)
                        .compose(cards -> cardService.duplicateCards(boardId, cards, null, user))
                        .onSuccess(res -> {
                            eventStore.createAndStoreEvent(CREATE.name(), user, new JsonObject()
                                    .put(Field.RESOURCE_DASH_TYPE, Field.RESOURCE_MAGNET));
                            renderJson(request, res);
                        })
                        .onFailure(err -> renderError(request));
            });
        });
    }

    @Post("/card/move")
    @ApiDoc("Move a card to another board")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void moveCard(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "moveCard", moveCard -> {
            UserUtils.getUserInfos(eb, request, user -> {
                I18nHelper i18nHelper = new I18nHelper(getHost(request), I18n.acceptLanguage(request));
                String oldBoardId = moveCard.getJsonObject(Field.CARD).getString(Field.BOARDID);
                CardPayload updateCard = new CardPayload(moveCard.getJsonObject(Field.CARD))
                        .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT))
                        .setLastModifierId(user.getUserId())
                        .setLastModifierName(user.getUsername())
                        .setBoardId(moveCard.getString(Field.BOARDID));

                Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(moveCard.getString(Field.BOARDID)));
                Future<List<Board>> getOldBoardFuture = boardService.getBoards(Collections.singletonList(oldBoardId));
                Future<List<Section>> getSectionFuture = sectionService.getSectionsByBoardId(moveCard.getString(Field.BOARDID));
                Future<List<Section>> getOldSectionFuture = sectionService.getSectionsByBoardId(oldBoardId);
                CompositeFuture.all(getBoardFuture, getOldBoardFuture, getSectionFuture, getOldSectionFuture)
                        .compose(result -> {
                            if (!getOldBoardFuture.result().isEmpty() && !getBoardFuture.result().isEmpty()) {
                                List<Future> updateBoardsFutures = new ArrayList<>();
                                Board currentBoard = getBoardFuture.result().get(0);
                                Board oldBoard = getOldBoardFuture.result().get(0);

                                // Add cards in current board
                                if (currentBoard.isLayoutFree()) {
                                    // Add cards ids to new board if free
                                    cardService.addCardWithLocked(updateCard, updateBoardsFutures, currentBoard, user);
                                } else {
                                    // Add cards ids to new board for section
                                    String defaultTitle = i18nHelper.translate("magneto.section.default.title");
                                    cardService.addCardSectionWithLocked(updateCard, getSectionFuture, updateBoardsFutures, currentBoard, defaultTitle, user);
                                }

                                // Remove cards in old board
                                if (oldBoard.isLayoutFree()) {
                                    // Remove cards ids from old board
                                    cardService.removeCardWithLocked(moveCard, getOldBoardFuture, updateBoardsFutures, user);
                                } else {
                                    // Remove cards ids from old board for section
                                    cardService.removeCardSectionWithLocked(updateCard, oldBoardId, getOldSectionFuture, updateBoardsFutures, currentBoard, user);
                                }

                                updateBoardsFutures.add(cardService.update(updateCard));
                                return CompositeFuture.all(updateBoardsFutures);
                            } else {
                                return Future.failedFuture(String.format("[Magneto%s::moveCard] " +
                                        "No board found with id %s", this.getClass().getSimpleName(), oldBoardId));
                            }
                        })
                        .onFailure(err -> renderError(request))
                        .onSuccess(res -> renderJson(request, new JsonObject()));
            });
        });
    }

    @Delete("/cards/:boardId")
    @ApiDoc("Delete cards")
    @ResourceFilter(WriteBoardRight.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    @Trace(Actions.CARD_DELETION)
    @SuppressWarnings("unchecked")
    public void deleteCards(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "cardList", cards ->
                UserUtils.getUserInfos(eb, request, user -> {
                            List<String> cardIds = cards.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
                            String boardId = request.getParam(Field.BOARDID);
                            Future<List<Board>> getBoardFuture = boardService.getBoards(Collections.singletonList(boardId));
                            Future<List<Section>> getSectionFuture = sectionService.getSectionsByBoardId(boardId);
                    CompositeFuture.all(getBoardFuture, getSectionFuture)
                                    .compose(result -> {
                                        if (!getBoardFuture.result().isEmpty()) {
                                            Board currentBoard = getBoardFuture.result().get(0);
                                            List<Future> removeCardsFutures = new ArrayList<>();

                                            cardService.deleteCardsWithLocked(cardIds, getSectionFuture, currentBoard, removeCardsFutures, user);
                                            removeCardsFutures.add(cardService.deleteCards(cardIds));
                                            return CompositeFuture.all(removeCardsFutures);
                                        } else {
                                            return Future.failedFuture(String.format("[Magneto%s::deleteCards] " +
                                                    "No board found with id %s", this.getClass().getSimpleName(), boardId));
                                        }
                                    })
                                    .onFailure(err -> renderError(request))
                                    .onSuccess(res -> renderJson(request, new JsonObject()));
                        }
                ));
    }
}
