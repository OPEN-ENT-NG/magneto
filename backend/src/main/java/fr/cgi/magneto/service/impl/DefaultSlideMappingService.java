// DefaultSlideMappingService.java
package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.core.enums.ResourceType;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.slide.*;
import fr.cgi.magneto.service.*;
import io.vertx.core.Future;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import java.util.*;
import java.util.stream.Collectors;

public class DefaultSlideMappingService implements SlideMappingService {
    private final BoardService boardService;
    private final SectionService sectionService;
    private final CardService cardService;

    protected static final Logger log = LoggerFactory.getLogger(DefaultSlideMappingService.class);

    public DefaultSlideMappingService(ServiceFactory serviceFactory) {
        this.boardService = serviceFactory.boardService();
        this.sectionService = serviceFactory.sectionService();
        this.cardService = serviceFactory.cardService();
    }
    @SuppressWarnings("unchecked")
    @Override
    public Future<List<SlideResource>> generateSlideMapping(String boardId) {
        Promise<List<SlideResource>> promise = Promise.promise();
    
        CompositeFuture.all(
                boardService.getBoards(Collections.singletonList(boardId)),
                sectionService.getSectionsByBoardId(boardId))
                .compose(results -> {
                    try {
                        Board board = ((List<Board>) results.resultAt(0)).get(0);
                        List<Section> sections = (List<Section>) results.resultAt(1);
    
                        if (board.isLayoutFree()) {
                            List<Future> cardFutures = sections.stream()
                                    .map(section -> cardService.getAllCardsBySection(section, null, null))
                                    .collect(Collectors.toList());
                            return CompositeFuture.all(cardFutures)
                                    .map(cardResults -> buildFreeLayoutSlideSequence(board, (JsonObject) cardResults.resultAt(0)));
                        } else {
                            List<Future> cardFutures = sections.stream()
                                    .map(section -> cardService.getAllCardsBySection(section, null, null))
                                    .collect(Collectors.toList());
                            return CompositeFuture.all(cardFutures)
                                    .map(cardResults -> buildSectionLayoutSlideSequence(board, sections, cardResults));
                        }
                    } catch (Exception e) {
                        log.error(String.format(
                                "[Magneto@%s::generateSlideMapping] Failed to generate slide mapping : %s",
                                this.getClass().getSimpleName(), e.getMessage()));
                        return Future.failedFuture(e);
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(err -> {
                    log.error(String.format(
                            "[Magneto@%s::generateSlideMapping] Failed to generate slide mapping : %s",
                            this.getClass().getSimpleName(), err.getMessage()), err);
                    promise.fail(err);
                });
    
        return promise.future();
    }
    private List<SlideResource> buildFreeLayoutSlideSequence(Board board, JsonObject cardsResult) {
        List<SlideResource> slides = new ArrayList<>();

        // Title slide
        slides.add(new SlideResource(null, board.getTitle(), ResourceType.TITLE, null, board.getImageUrl(), null));

        // Description slide if exists
        if (board.getDescription() != null && !board.getDescription().isEmpty()) {
            slides.add(new SlideResource(null, null, ResourceType.DESCRIPTION, board.getDescription(), null, null));
        }

        // Cards
        if (cardsResult != null && cardsResult.getJsonArray("all") != null) {
            cardsResult.getJsonArray("all").forEach(card -> {
                JsonObject cardObj = (JsonObject) card;
                slides.add(mapCardToSlide(cardObj));
            });
        }

        return slides;
    }

    private List<SlideResource> buildSectionLayoutSlideSequence(Board board, List<Section> sections,
            CompositeFuture cardResults) {
        List<SlideResource> slides = new ArrayList<>();

        // Title slide
        slides.add(new SlideResource(null, board.getTitle(), ResourceType.TITLE, null, board.getImageUrl(), null));

        // Description slide if exists
        if (board.getDescription() != null && !board.getDescription().isEmpty()) {
            slides.add(new SlideResource(null, null, ResourceType.DESCRIPTION, board.getDescription(), null, null));
        }

        // Process each section and its cards
        for (int i = 0; i < sections.size(); i++) {
            Section section = sections.get(i);
            JsonObject cardsData = (JsonObject) cardResults.resultAt(i);

            // Section title slide
            slides.add(new SlideResource(null, section.getTitle(), ResourceType.SECTION, null, null, null));

            // Section cards
            if (cardsData != null && cardsData.getJsonArray("all") != null) {
                cardsData.getJsonArray("all").forEach(card -> {
                    JsonObject cardObj = (JsonObject) card;
                    slides.add(mapCardToSlide(cardObj));
                });
            }
        }

        return slides;
    }

    private SlideResource mapCardToSlide(JsonObject card) {
        return new SlideResource(
                card.getString("id"),
                card.getString("title"),
                ResourceType.fromString(card.getString("resourceType")),
                card.getString("description"),
                card.getString("resourceUrl"),
                card.getJsonObject("metadata") != null ? card.getJsonObject("metadata").getMap() : null);
    }
}
