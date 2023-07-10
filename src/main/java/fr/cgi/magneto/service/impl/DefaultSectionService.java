package fr.cgi.magneto.service.impl;

import com.mongodb.QueryBuilder;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.helper.PromiseHelper;
import fr.cgi.magneto.model.MongoQuery;
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
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.stream.Collectors;

public class DefaultSectionService implements SectionService {

    public final MongoDb mongoDb;
    public final String collection;
    private final ServiceFactory serviceFactory;
    protected static final Logger log = LoggerFactory.getLogger(DefaultSectionService.class);

    public DefaultSectionService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.serviceFactory = serviceFactory;
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
    public Future<List<Section>> getSectionsByBoard(Board board) {
        Promise<List<Section>> promise = Promise.promise();
        JsonObject query = this.getAllSectionsByBoardQuery(board);
        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(either -> {
            if (either.isLeft()) {
                log.error("[Magneto@%s::getSectionsByBoard] Failed to get sections", this.getClass().getSimpleName(),
                        either.left().getValue());
                promise.fail(either.left().getValue());
            } else {
                JsonArray result = either.right().getValue()
                        .getJsonObject(Field.CURSOR, new JsonObject())
                        .getJsonArray(Field.FIRSTBATCH, new JsonArray());
                promise.complete(ModelHelper.toList(result, Section.class));
            }
        }));

        return promise.future();
    }

    private JsonObject getAllSectionsByBoardQuery(Board board) {
        MongoQuery query = new MongoQuery(this.collection)
                .match(new JsonObject().put(Field.BOARDID, board.getId()));
        JsonArray sectionIds = new JsonArray(board.sectionIds());
        query.match(new JsonObject().put(Field._ID, new JsonObject().put(Mongo.IN, sectionIds)))
                .addFields(Field.INDEX, new JsonObject()
                        .put(Mongo.INDEX_OF_ARRAY, new JsonArray()
                                .add(sectionIds)
                                .add('$' + Field._ID)
                        )
                )
                .sort(Field.INDEX, 1)
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.TITLE, 1)
                        .put(Field.BOARDID, 1)
                        .put(Field.CARDIDS, 1));
        return query.getAggregate();
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
            promise.complete(newSection);
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> update(SectionPayload section) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject sectionUpdate = new JsonObject()
                .put(Field._ID, section.getId());
        JsonObject update = new JsonObject().put(Mongo.SET, section.toJson());
        mongoDb.update(this.collection, sectionUpdate, update, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateSection] Failed to update section", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete(sectionUpdate);
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

    @Override
    public Future<JsonObject> deleteSections(List<String> sectionIds, String boardId, Boolean deleteCards) {
        Promise<JsonObject> promise = Promise.promise();
        List<Future> removeSectionsFuture = new ArrayList<>();
        Future<List<Section>> getSectionsFuture = this.getSectionsByBoardId(boardId);
        Future<List<Board>> getBoardFuture = this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId));
        CompositeFuture.all(getBoardFuture, getSectionsFuture)
                .compose(result -> {
                    // Check if board and section are not empty
                    if (result.succeeded() && !getBoardFuture.result().isEmpty() && !getSectionsFuture.result().isEmpty()) {
                        Board currentBoard = getBoardFuture.result().get(0);
                        BoardPayload boardToUpdate = new BoardPayload()
                                .setId(currentBoard.getId())
                                .setSectionIds(currentBoard.sections()
                                        .stream()
                                        .map(Section::getId)
                                        .collect(Collectors.toList())).removeSectionIds(sectionIds)
                                .setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));

                        // If deleteCards is true, we remove all cards from the section.
                        // Otherwise, we move them to the first section available
                        if (deleteCards) {
                            removeSectionsFuture.add(this.serviceFactory.cardService().deleteCards(currentBoard.getCardsBySection(sectionIds)));
                        } else {
                            Section firstSection = getSectionsFuture.result()
                                    .stream()
                                    .filter(section -> section.getId().equals(boardToUpdate.getSectionIds().get(0)))
                                    .findFirst()
                                    .orElse(null);
                            if (firstSection != null) {
                                SectionPayload sectionToUpdate = new SectionPayload(firstSection.toJson())
                                        .addCardIds(currentBoard.getCardsBySection(sectionIds));
                                removeSectionsFuture.add(this.update(sectionToUpdate));
                            } else {
                                String message = String.format("[Magneto%s::deleteSections] " +
                                        "No section is available to move cards inside", this.getClass().getSimpleName());
                                promise.fail(message);
                                removeSectionsFuture.add(Future.failedFuture(message));
                            }
                        }
                        removeSectionsFuture.add(this.serviceFactory.boardService().update(boardToUpdate));
                        removeSectionsFuture.add(this.delete(sectionIds));
                        return CompositeFuture.all(removeSectionsFuture);
                    } else {
                        return Future.failedFuture(String.format("[Magneto%s::deleteSections] " +
                                "No board found with id %s", this.getClass().getSimpleName(), boardId));
                    }
                })
                .onFailure(promise::fail)
                .onSuccess(success -> promise.complete(new JsonObject().put(Field.SECTIONIDS, sectionIds)));

        return promise.future();
    }

    public Future<JsonObject> updateBoard(BoardPayload board) {
        if (board == null) {
            String message = String.format("[Magneto@%s::updateBoard] Failed to update board",
                    this.getClass().getSimpleName());
            return Future.failedFuture(message);
        }
        return this.serviceFactory.boardService().update(board);
    }

    public Future<JsonObject> duplicateSections(String boardId, List<Section> sections, List<Card> cards,
                                                boolean isDuplicateBoard, UserInfos user) {
        Promise<JsonObject> promise = Promise.promise();
        this.serviceFactory.boardService().getBoards(Collections.singletonList(boardId))
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
            cardsFilter.sort(Comparator.comparing(card -> section.getCardIds().indexOf(card.getId())));

            SectionPayload sectionPayload = new SectionPayload(section.toJson())
                    .setId(null)
                    .setBoardId(boardId)
                    .setCardIds(new ArrayList<>());
            duplicateFutures.add(duplicateSection(sectionPayload, newId));
            duplicateFutures.add(this.serviceFactory.cardService().duplicateCards(boardId, cardsFilter, sectionPayload.setId(newId), user));
        }

        CompositeFuture.all(duplicateFutures)
                .compose(result -> {
                    BoardPayload boardPayload = new BoardPayload(boardResult.toJson());
                    List<String> newSectionIds = new ArrayList<>();
                    for (Future duplicateFuture : duplicateFutures) {
                        if (!(duplicateFuture.result() instanceof JsonObject)) {
                            newSectionIds.add(String.valueOf(duplicateFuture.result()));
                        }
                    }
                    if (isDuplicateBoard) {
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
