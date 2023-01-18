package fr.cgi.magneto.service.impl;

import com.mongodb.QueryBuilder;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.helper.PromiseHelper;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.boards.BoardPayload;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.service.BoardService;
import fr.cgi.magneto.service.CardService;
import fr.cgi.magneto.service.SectionService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class DefaultSectionService implements SectionService {

    public final MongoDb mongoDb;
    public final String collection;
    private final BoardService boardService;
    private final CardService cardService;
    protected static final Logger log = LoggerFactory.getLogger(DefaultSectionService.class);

    public DefaultSectionService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.boardService = serviceFactory.boardService();
        this.cardService = serviceFactory.cardService();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Future<List<Section>> get(List<String> sectionIds) {
        Promise<List<Section>> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field._ID).in(sectionIds);
        mongoDb.find(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::get] Failed to get sections", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(ModelHelper.toList(results.right().getValue(), Section.class));
        }));
        return promise.future();
    }

    @Override
    @SuppressWarnings("unchecked")
    public Future<List<Section>> getSectionsByBoardId(String boardId) {
        Promise<List<Section>> promise = Promise.promise();
        QueryBuilder matcher = QueryBuilder.start(Field.BOARDID).is(boardId);
        mongoDb.find(this.collection, MongoQueryBuilder.build(matcher), MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getSectionsByBoardId] Failed to get sections", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(ModelHelper.toList(results.right().getValue(), Section.class));
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> create(SectionPayload section, String newId) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject newSection = section.toJson().put(Field._ID, newId);
        mongoDb.insert(this.collection, newSection, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::createSection] Failed to create section", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(SectionPayload section) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, section.getId());
        JsonObject update = new JsonObject().put(Mongo.SET, section.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateSection] Failed to update section", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> delete(List<String> sectionIds) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, sectionIds));
        mongoDb.delete(this.collection, query,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::deleteSections] Failed to delete sections",
                                this.getClass().getSimpleName()))));

        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteByBoards(List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field.BOARDID, new JsonObject().put(Mongo.IN, boardIds));
        mongoDb.delete(this.collection, query,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::deleteByBoardsSections] Failed to delete sections by board",
                                this.getClass().getSimpleName()))));

        return promise.future();
    }

    public Future<JsonObject> updateBoard(BoardPayload board) {
        if (board == null) {
            String message = String.format("[Magneto@%s::updateBoard] Failed to update board",
                    this.getClass().getSimpleName());
            return Future.failedFuture(message);
        }
        return boardService.update(board);
    }

    public Future<JsonObject> duplicateSections(String boardId, List<Section> sections, List<Card> cards,
                                                boolean isDuplicateBoard, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        boardService.getBoards(Collections.singletonList(boardId))
                .compose(boardResult -> {
                    if (!boardResult.isEmpty()) {
                        return duplicateSectionsFuture(boardId, sections, cards, boardResult.get(0), isDuplicateBoard, user);
                    } else {
                        return Future.failedFuture(String.format("[Magneto%s::duplicateSections] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId));
                    }
                })
                .onSuccess(promise::complete)
                .onFailure(promise::fail);
        return promise.future();
    }

    private Future<JsonObject> duplicateSectionsFuture(String boardId, List<Section> sections, List<Card> cards,
                                                       Board boardResult, boolean isDuplicateBoard, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        List<Future> duplicateFutures = new ArrayList<>();

        for (Section section : sections) {
            String newId = UUID.randomUUID().toString();
            List<Card> cardsFilter = cards
                    .stream()
                    .filter(card -> section.getCardIds().contains(card.getId()))
                    .collect(Collectors.toList());
            SectionPayload sectionPayload = new SectionPayload(section.toJson())
                    .setId(null)
                    .setBoardId(boardId)
                    .setCardIds(new ArrayList<>());
            duplicateFutures.add(duplicateSection(sectionPayload, newId));
            duplicateFutures.add(cardService.duplicateCards(boardId, cardsFilter, sectionPayload.setId(newId), user));
        }

        CompositeFuture.all(duplicateFutures)
                .compose(result -> {
                    BoardPayload boardPayload = new BoardPayload(boardResult.toJson());
                    List<String> newSectionIds = new ArrayList<>();
                    for (Future duplicateFuture : duplicateFutures) {
                        if (duplicateFuture.result() != null) {
                            newSectionIds.add(String.valueOf(duplicateFuture.result()));
                        }
                    }
                    if(isDuplicateBoard) {
                        boardPayload.setSectionIds(newSectionIds);
                    } else {
                        boardPayload.addSections(newSectionIds);
                    }
                    return this.updateBoard(boardPayload);
                })
                .onSuccess(promise::complete)
                .onFailure(fail -> {
                    String message = String.format("[Magneto@%s::duplicateSectionsFuture] Failed to duplicate sections : %s",
                            this.getClass().getSimpleName(), fail.getMessage());
                    promise.fail(message);
                });
        return promise.future();
    }

    private Future<String> duplicateSection(SectionPayload sectionPayload, String newId) {
        Promise<String> promise = Promise.promise();
        this.create(sectionPayload, newId)
                .compose(createCardResult -> {
                    promise.complete(newId);
                    return Future.succeededFuture();
                });
        return promise.future();
    }
}
