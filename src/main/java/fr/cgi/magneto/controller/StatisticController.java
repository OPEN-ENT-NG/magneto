package fr.cgi.magneto.controller;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.statistics.StatisticsPayload;
import fr.cgi.magneto.security.ViewRight;
import fr.cgi.magneto.service.*;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Post;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.CompositeFuture;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.filter.ResourceFilter;
import org.entcore.common.http.filter.SuperAdminFilter;


import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

public class StatisticController extends ControllerHelper {
    private final BoardService boardService;
    private final CardService cardService;
    private final UserService userService;


    public StatisticController(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.cardService = serviceFactory.cardService();
        this.userService = serviceFactory.userService();
    }

    @Post("/statistics")
    @ApiDoc("Get statistics from board/magnet")
    @ResourceFilter(SuperAdminFilter.class)
    @SecuredAction(value = "", type = ActionType.RESOURCE)
    public void getStatistics(HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "statistics", statistics -> {
            StatisticsPayload statisticsPayload = new StatisticsPayload(statistics);
            HashMap<String, List<?>> results = new HashMap<>();
            CompositeFuture.all(boardService.getAllBoardsByCreationDate(statisticsPayload), cardService.getAllCardsByCreationDate(statisticsPayload))
                    .compose(res -> {
                        List<Board> boards = res.resultAt(0);
                        List<Card> cards = res.resultAt(1);
                        results.put(Field.BOARD, boards);
                        results.put(Field.CARD, cards);
                        List<String> users = boards.stream()
                                .map(Board::getOwnerId)
                                .distinct()
                                .collect(Collectors.toList());

                        users.addAll(cards.stream()
                                .map(Card::getOwnerId)
                                .distinct()
                                .collect(Collectors.toList()));
                        return userService.getUsersByIds(users);
                    })
                    .onFailure(err -> renderError(request))
                    .onSuccess(res -> {
                        JsonObject result = new JsonObject()
                                .put(Field.BOARD, results.get(Field.BOARD))
                                .put(Field.CARD, results.get(Field.CARD))
                                .put(Field.USER, res);
                        renderJson(request, result);
                    });
        });
    }
}
