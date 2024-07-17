package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.FutureHelper;
import fr.cgi.magneto.helper.PromiseHelper;
import fr.cgi.magneto.helper.ShareHelper;
import fr.cgi.magneto.model.FolderPayload;
import fr.cgi.magneto.model.MongoQuery;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.share.SharedElem;
import fr.cgi.magneto.service.FolderService;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.user.UserInfos;
import org.entcore.common.share.ShareNormalizer;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

public class DefaultFolderService implements FolderService {

    public final MongoDb mongoDb;
    public final String collection;
    private final ServiceFactory serviceFactory;
    private final ShareNormalizer shareNormalizer;

    protected static final Logger log = LoggerFactory.getLogger(DefaultFolderService.class);

    public DefaultFolderService(String collection, MongoDb mongo, ServiceFactory serviceFactory) {
        this.collection = collection;
        this.mongoDb = mongo;
        this.serviceFactory = serviceFactory;
        this.shareNormalizer = serviceFactory.shareNormalizer();
    }

    public Optional<UserInfos> getCreatorForModel(final JsonObject json) {
        if (!json.containsKey(Field.OWNERID)){
            return Optional.empty();
        }
        final UserInfos user = new UserInfos();
        user.setUserId(json.getString(Field.OWNERID));
        return Optional.of(user);
    }

    private JsonObject addNormalizedShares(final JsonObject folder) {
        try {
            if(folder != null) {
                this.shareNormalizer.addNormalizedRights(folder, e -> getCreatorForModel(e).map(UserInfos::getUserId));
            }
            return folder;
        }
        catch (Exception e) {
            log.error(String.format("[Magneto@%s::addNormalizedShares] Failed to apply normalized shares : %s", this.getClass().getSimpleName(), e.getMessage()));
            return folder;
        }
    }

    @Override
    public Future<JsonArray> getFolders(UserInfos user, boolean isDeleted) {
        Promise<JsonArray> promise = Promise.promise();

        JsonObject query = new JsonObject().put(Mongo.OR,
                new JsonArray()
                        .add(new JsonObject().put(Field.OWNERID, user.getUserId()))
                        .add(new JsonObject().put(String.format("%s.%s", Field.SHARED, Field.USERID),
                                new JsonObject().put(Mongo.IN, new JsonArray().add(user.getUserId()))))
                        .add(new JsonObject().put(String.format("%s.%s", Field.SHARED, Field.GROUPID),
                                new JsonObject().put(Mongo.IN, user.getGroupsIds()))));


        if (isDeleted) {
            query.put(Field.DELETED, true);
        } else {
            query.put(Field.DELETED, new JsonObject().put(Mongo.NE, true));
        }

        mongoDb.find(this.collection, query, MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolders] Failed to get folders", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            JsonArray folders = new JsonArray(results.right().getValue()
                    .stream()
                    .filter(JsonObject.class::isInstance)
                    .map(JsonObject.class::cast)
                    .map(folder -> addNormalizedShares(folder))
                    .collect(Collectors.toList()));
            promise.complete(folders);
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> createFolder(FolderPayload folder) {
        Promise<JsonObject> promise = Promise.promise();
        if (folder.getParentId() != null) {
            this.getFolderSharedRights(folder.getParentId())
                    .onSuccess(s -> {
                        folder.setShared(s);
                        mongoCreation(folder, promise);
                    })
                    .onFailure(error -> promise.fail(error.getMessage()));
        } else {
            mongoCreation(folder, promise);
        }
        return promise.future();
    }

    private void mongoCreation(FolderPayload folder, Promise<JsonObject> promise) {
        mongoDb.insert(this.collection, folder.toJson(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::createFolder] Failed to create folder", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
    }

    @Override
    public Future<JsonObject> updateFolder(UserInfos user, FolderPayload folder) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, folder.getId())
                .put(Field.OWNERID, user.getUserId());
        JsonObject update = new JsonObject().put(Mongo.SET, folder.toJson());
        mongoDb.update(this.collection, query, update, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::updateFolder] Failed to update folder", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            promise.complete();
        }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> deleteFoldersAndBoards(UserInfos user, List<String> folderIds) {
        Promise<JsonObject> promise = Promise.promise();

        deleteBoardsInFolderWithChildren(folderIds, user.getUserId())
                .compose(v -> deleteFoldersWithChildren(folderIds, user.getUserId()))
                .onFailure(promise::fail)
                .onSuccess(promise::complete);

        return promise.future();
    }

    private Future<JsonObject> deleteFoldersWithChildren(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();
        this.getFolderChildrenIds(folderIds)
                .compose(childrenIds -> {
                    folderIds.addAll(childrenIds);
                    return this.deleteFolders(folderIds, ownerId);
                })
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete());
        return promise.future();
    }

    private Future<JsonObject> deleteFolders(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field.OWNERID, ownerId)
                .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds));
        mongoDb.delete(this.collection, query,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::deleteFolders] Failed to delete folders",
                                this.getClass().getSimpleName()))));

        return promise.future();
    }

    private Future<JsonObject> deleteBoardsInFolderWithChildren(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();
        Future<List<String>> folderChildrenIds = this.getFolderChildrenIds(folderIds);
        folderChildrenIds
                .compose(this::getBoardIdsInFolders)
                .compose(childrenIds -> this.serviceFactory.boardService().delete(ownerId, childrenIds))
                .onFailure(promise::fail)
                .onSuccess(res -> promise.complete());
        return promise.future();
    }


    @SuppressWarnings("unchecked")
    private Future<List<String>> getBoardIdsInFolders(List<String> folderIds) {
        Promise<List<String>> promise = Promise.promise();
        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds)))
                .project(new JsonObject().put(Field.BOARDIDS, 1))
                .getAggregate();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getBoardIdsInFolders] Failed to get board ids in folders", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            JsonArray result = results.right().getValue()
                    .getJsonObject(Mongo.CURSOR, new JsonObject())
                    .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());

            List<String> boardIds = ((List<JsonObject>) result.getList()).stream().flatMap(r -> {
                List<String> bIds = (r.getJsonArray(Field.BOARDIDS, new JsonArray())).getList();
                return bIds.stream();
            }).collect(Collectors.toList());

            promise.complete(boardIds);
        }));


        return promise.future();
    }

    /**
     * Returns list of folder ids that are only my folders
     *
     * @param folderIds {@link List<String>} the initial list of folder ids
     * @return {@link Future<List<String>>} the initial list minus the ids of the folders that are not mine
     */
    private Future<List<String>> filterMyFolderIds(List<String> folderIds, String userId) {
        Promise<List<String>> promise = Promise.promise();

        JsonObject query = new JsonObject().put(Mongo.AND,
                new JsonArray()
                        .add(new JsonObject().put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(folderIds)))));

        mongoDb.find(this.collection, query, MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::filterMyFolders] Failed to get folders", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            List<JsonObject> filteredFolders = (List<JsonObject>) results.right().getValue().getList();
            List<String> filteredFoldersIds = filteredFolders.stream()
                    .map(folder -> folder.getString(Field._ID, ""))
                    .collect(Collectors.toList());
            promise.complete(filteredFoldersIds);
        }));


        return promise.future();
    }


    @Override
    public Future<JsonObject> preDeleteFoldersAndBoards(UserInfos user, List<String> folderIds, boolean restore) {
        Promise<JsonObject> promise = Promise.promise();

        this.preDeleteBoardsInFolderWithChildren(folderIds, restore, user.getUserId())
                .compose(v -> this.preDeleteFoldersWithChildren(folderIds, restore, user.getUserId()))
                .onFailure(promise::fail)
                .onSuccess(promise::complete);

        return promise.future();
    }


    private Future<JsonObject> preDeleteBoardsInFolderWithChildren(List<String> folderIds, boolean restore, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        Future<List<String>> foldersFuture = getFolderChildrenIds(folderIds);
        foldersFuture
                .compose(this::getBoardIdsInFolders)
                .compose(childrenIds -> {
                    if (restore) {
                        return this.serviceFactory.boardService().preDeleteBoards(ownerId, childrenIds, true);
                    } else {
                        folderIds.addAll(foldersFuture.result());
                        return handlePreDeleteBoards(ownerId, childrenIds, folderIds);
                    }
                })
                .onFailure(promise::fail)
                .onSuccess(promise::complete);
        return promise.future();
    }

    private Future<JsonObject> handlePreDeleteBoards(String ownerId, List<String> childrenIds, List<String> folderIds) {
        Promise<JsonObject> promise = Promise.promise();
        AtomicReference<JsonObject> result = new AtomicReference<>(new JsonObject());

        this.serviceFactory.boardService().preDeleteBoards(ownerId, childrenIds, false)
                .compose(boardsIds -> {
                    result.set(boardsIds);
                    return getBoardIfSameOwnerAsParent(childrenIds);
                })
                .compose(res -> this.updateFoldersBoardsIds(res, folderIds))
                .onFailure(promise::fail)
                .onSuccess(ignored -> promise.complete(result.get()));

        return promise.future();
    }

    private Future<Void> updateFoldersBoardsIds(JsonArray boardsWithFolder, List<String> foldersIds) {
        Promise<Void> promise = Promise.promise();
        Map<String, List<String>> folderBoardsIdMap = new HashMap<>();
        boardsWithFolder.stream()
                .filter(JsonObject.class::isInstance)
                .map(JsonObject.class::cast)
                .filter(boardWithFolder -> boardWithFolder.containsKey(Field.OWNERID) && boardWithFolder.containsKey(Field.FOLDERID)
                        && !boardWithFolder.getString(Field.FOLDERID).isEmpty())
                .forEach(boardWithFolder -> {
                    List<String> boardsIds = new ArrayList<>();
                    if (folderBoardsIdMap.containsKey(boardWithFolder.getString(Field.FOLDERID))) {
                        boardsIds = folderBoardsIdMap.get(boardWithFolder.getString(Field.FOLDERID));
                    }
                    boardsIds.add(boardWithFolder.getString(Field._ID));
                    folderBoardsIdMap.put(boardWithFolder.getString(Field.FOLDERID), boardsIds);
                });
        List<Future<JsonObject>> futures = new ArrayList<>();
        foldersIds.forEach(folderId -> futures.add(
                (folderBoardsIdMap.containsKey(folderId))
                        ? setBoardsIds(folderBoardsIdMap.get(folderId), folderId)
                        : setBoardsIds(new ArrayList<>(), folderId)
        ));
        FutureHelper.all(futures)
                .onSuccess(res -> promise.complete())
                .onFailure(promise::fail);
        return promise.future();
    }

    private Future<JsonArray> getBoardIfSameOwnerAsParent(List<String> boardsIds) {
        Promise<JsonArray> promise = Promise.promise();
        JsonObject query = new MongoQuery(CollectionsConstant.BOARD_COLLECTION)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, boardsIds))
                )
                .lookUp(this.collection, Field._ID, Field.BOARDIDS, Field.FOLDER)
                .unwind(Field.FOLDER, true)
                .match(new JsonObject().put(Mongo.EXPR,
                        new JsonObject().put(Mongo.EQ,
                                new JsonArray()
                                        .add(String.format("$%s", Field.OWNERID))
                                        .add(String.format("$%s.%s", Field.FOLDER, Field.OWNERID)))))
                .project(new JsonObject()
                        .put(Field._ID, 1)
                        .put(Field.OWNERID, 1)
                        .put(Field.FOLDERID, String.format("$%s.%s", Field.FOLDER, Field._ID)))
                .getAggregate();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getBoardIfSameOwnerAsParent] Failed to get folders that do not have same owner as parent: ",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonArray responseArray = results.right().getValue()
                    .getJsonObject(Field.CURSOR, new JsonObject())
                    .getJsonArray(Field.FIRSTBATCH, new JsonArray());

            promise.complete(responseArray);
        }));

        return promise.future();
    }

    private Future<JsonObject> preDeleteFoldersWithChildren(List<String> folderIds, boolean restore, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        if (restore) {
            Future<JsonObject> preDeleteFoldersParentFuture = this.preDeleteFoldersParent(folderIds);
            getFolderChildrenIdsOwnerOnly(folderIds, ownerId)
                    .compose(childrenIds -> this.preRestoreChildren(childrenIds, ownerId))
                    .compose(r -> preDeleteFoldersParentFuture)
                    .compose(r -> this.handleSharedParent(folderIds))
                    .onFailure(promise::fail)
                    .onSuccess(r -> promise.complete(preDeleteFoldersParentFuture.result()));
        } else {
            List<String> folderChildrenIds = new ArrayList<>();

            this.getFolderChildrenIds(folderIds)
                    .compose(childrenFolderIds -> {
                        folderChildrenIds.addAll(childrenFolderIds);
                        return this.removeFolderParentIfNotSameOwnerAsParent(folderChildrenIds);
                    })
                    .compose(childrenIds -> {
                        folderIds.addAll(folderChildrenIds);
                        return this.preDeleteFolders(folderIds);
                    })
                    .compose(r -> this.getBoardIdsInFolders(folderIds))
                    .onFailure(promise::fail)
                    .onSuccess(result ->promise.complete(new JsonObject()));
        }
        return promise.future();
    }

    private Future<JsonObject> handleSharedParent(List<String> folderIds) {
        Promise<JsonObject> promise = Promise.promise();
        List<Future<Void>> futures = new ArrayList<>();
        folderIds.forEach(id ->{
            futures.add(setSharedArrayFromParent(id));
        });
        FutureHelper.all(futures).onSuccess(t -> promise.complete(new JsonObject())).onFailure(promise::fail);
        return promise.future();
    }

    private Future<Void> setSharedArrayFromParent(String id) {
        Promise<Void> promise = Promise.promise();
        this.getFolders(Collections.singletonList(id))
                .onSuccess(folder -> {
                    if (!folder.isEmpty()) {
                        String folderId = folder.getJsonObject(0).getString(Field._ID);
                        String parentId = folder.getJsonObject(0).getString(Field.PARENTID, "");
                        if (parentId != null && !parentId.isEmpty()) {
                            this.getFolders(Collections.singletonList(parentId)) //Get ParentData
                                    .onSuccess(rest -> {
                                        JsonArray sharedArray = rest.getJsonObject(0).getJsonArray(Field.SHARED, new JsonArray());
                                        if (!sharedArray.isEmpty()) {
                                            handleSharedDirectory(id, folderId, sharedArray, promise);
                                        } else {
                                            promise.complete();
                                        }
                                    })
                                    .onFailure(promise::fail);
                        } else {
                            promise.complete();
                        }
                    } else {
                        promise.complete();
                    }
                })
                .onFailure(promise::fail);
        return promise.future();
    }

    private void handleSharedDirectory(String id, String folderId, JsonArray sharedArray, Promise<Void> promise) {
        List<SharedElem> sharedElems = ShareHelper.getSharedElem(sharedArray);
        this.shareFolder(folderId, sharedElems, new ArrayList<>())
                .compose(success -> this.getChildrenBoardsIds(id))
                .compose(boardsIds -> this.serviceFactory.boardService().shareBoard(boardsIds,sharedElems, new ArrayList<>(), false))
                .compose(boardsIds -> this.serviceFactory.workSpaceService().setShareRights(boardsIds,
                        this.serviceFactory.shareService().getSharedJsonFromList(sharedElems)))
                .onSuccess(s -> promise.complete())
                .onFailure(promise::fail);
    }

    private Future<JsonObject> preDeleteFoldersParent(List<String> folderIds) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(folderIds)));

        JsonObject update = new JsonObject()
                .put(Mongo.SET, new JsonObject().put(Field.DELETED, false))
                .put(Mongo.UNSET, new JsonObject().put(Field.SHARED, 1));
        mongoDb.update(this.collection, query, update, false, true,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::preDeleteFolders] Failed to pre-delete folders",
                                this.getClass().getSimpleName()))));
        return promise.future();
    }

    private Future<JsonObject> preRestoreChildren(List<String> folderIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(folderIds)))
                .put(Field.OWNERID, ownerId);

        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject()
                .put(Field.DELETED, false)).put(Mongo.UNSET, new JsonObject().put(Field.SHARED, 1));
        mongoDb.update(this.collection, query, update, false, true,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::preDeleteFolders] Failed to pre-delete folders",
                                this.getClass().getSimpleName()))));
        return promise.future();
    }

    private Future<Void> removeFolderParentIfNotSameOwnerAsParent (List<String> folderChildrenIds) {
        Promise<Void> promise = Promise.promise();

        this.getFolderIfNotSameOwnerAsParent(folderChildrenIds)
                .compose(folderIdsObject -> {
                    JsonArray folderIds = folderIdsObject.getJsonArray(Field.FOLDERIDS, new JsonArray());

                    return this.removeFoldersParent(folderIds);
                })
                .onSuccess(promise::complete)
                .onFailure(promise::fail);

        return promise.future();
    }

    private Future<JsonObject> getFolderIfNotSameOwnerAsParent(List<String> folderChildrenIds) {
        Promise<JsonObject> promise = Promise.promise();

        Map<String, JsonObject> folderIdsAccumulators = new HashMap<>();
        folderIdsAccumulators.put(Field.FOLDERIDS, new JsonObject().put(Mongo.PUSH, String.format("$%s", Field._ID)));


        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, folderChildrenIds))
                        .put(Mongo.AND, new JsonArray()
                                .add(new JsonObject().put(Field.PARENTID, new JsonObject()
                                        .put(Mongo.EXISTS, true)))
                                .add(new JsonObject().put(Field.PARENTID, new JsonObject()
                                        .put(Mongo.NE, (String) null)))
                                .add(new JsonObject().put(Field.PARENTID, new JsonObject()
                                        .put(Mongo.NE, "")))
                        )
                )
                .lookUp(this.collection, Field.PARENTID, Field._ID, Field.PARENT)
                .addFields(Field.PARENTOWNER, new JsonObject()
                                .put(Mongo.ARRAYELEMAT, new JsonArray().add(String.format("$%s.%s", Field.PARENT, Field.OWNERID)).add(0))
                )
                .match(new JsonObject().put(Mongo.EXPR, new JsonObject()
                        .put(Mongo.NE, new JsonArray().add(String.format("$%s", Field.OWNERID)).add(String.format("$%s", Field.PARENTOWNER))
                        )
                ))
                .group(null, folderIdsAccumulators)
                .project(new JsonObject().put(Field._ID, 0).put(Field.FOLDERIDS, 1))
                .getAggregate();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolderIfNotSameOwnerAsParent] Failed to get folders that do not have same owner as parent: ",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonArray responseArray = results.right().getValue()
                    .getJsonObject(Field.CURSOR, new JsonObject())
                    .getJsonArray(Field.FIRSTBATCH, new JsonArray());

            JsonObject response = responseArray.size() > 0 ?
                    responseArray.getJsonObject(0) : new JsonObject();

            promise.complete(response);
        }));

        return promise.future();
    }

    private Future<Void> removeFoldersParent(JsonArray foldersToRemoveFromTree) {
        Promise<Void> promise = Promise.promise();

        JsonObject query = new JsonObject().put(Field._ID, new JsonObject()
                .put(Mongo.IN, foldersToRemoveFromTree));

        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject()
                .put(Field.PARENTID, (String) null));

        mongoDb.update(this.collection, query, update, false, true, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::removeFoldersParent] Failed to remove folders parents", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            promise.complete();
        }));

        return promise.future();
    }

    private Future<JsonObject> preDeleteFolders(List<String> folderIds) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, new JsonArray(folderIds)));

        JsonObject update = new JsonObject().put(Mongo.SET, new JsonObject()
                .put(Field.DELETED, true)).put(Mongo.UNSET, new JsonObject().put(Field.SHARED, 1));
        mongoDb.update(this.collection, query, update, false, true,
                MongoDbResult.validResultHandler(PromiseHelper.handler(promise,
                        String.format("[Magneto@%s::preDeleteFolders] Failed to pre-delete folders",
                                this.getClass().getSimpleName()))));
        return promise.future();
    }

    @Override
    public Future<JsonArray> getFolders(List<String> folderChildrenIds) {
        Promise<JsonArray> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, new JsonObject().put(Mongo.IN, folderChildrenIds));

        mongoDb.find(this.collection, query, MongoDbResult.validResultsHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolders] Failed to get folders", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }
            JsonArray folders = new JsonArray(results.right().getValue()
                    .stream()
                    .filter(JsonObject.class::isInstance)
                    .map(JsonObject.class::cast)
                    .map(folder -> addNormalizedShares(folder))
                    .collect(Collectors.toList()));
            promise.complete(folders);
        }));
        return promise.future();
    }

    @SuppressWarnings("unchecked")
    private Future<List<String>> getFolderChildrenIds(List<String> folderIds) {

        Promise<List<String>> promise = Promise.promise();

        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds)))
                .graphLookup(new JsonObject()
                        .put(Mongo.FROM, this.collection)
                        .put(Mongo.STARTWITH, String.format("$%s", Field._ID))
                        .put(Mongo.CONNECTFROMFIELD, Field._ID)
                        .put(Mongo.CONNECTTOFIELD, Field.PARENTID)
                        .put(Mongo.AS, Field.CHILDREN))
                .project(new JsonObject()
                        .put(Field.CHILDRENIDS, String.format("$%s.%s", Field.CHILDREN, Field._ID)))
                .getAggregate();


        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolderChildrenIds] Failed to get folder children ids",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonArray result = results.right().getValue()
                    .getJsonObject(Mongo.CURSOR, new JsonObject())
                    .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());

            List<String> childrenFolderIds = ((List<JsonObject>) result.getList()).stream().flatMap(r -> {
                List<String> childrenIds = (r.getJsonArray(Field.CHILDRENIDS, new JsonArray())).getList();
                childrenIds.add(r.getString(Field._ID));
                return childrenIds.stream();
            }).collect(Collectors.toList());


            promise.complete(childrenFolderIds);
        }));

        return promise.future();
    }

    private Future<List<String>> getFolderChildrenIdsOwnerOnly(List<String> folderIds, String ownerId) {
        JsonObject query = new MongoQuery(this.collection)
                .match(new JsonObject()
                        .put(Field._ID, new JsonObject().put(Mongo.IN, folderIds)))
                .graphLookup(new JsonObject()
                        .put(Mongo.FROM, this.collection)
                        .put(Mongo.STARTWITH, String.format("$%s", Field._ID))
                        .put(Mongo.CONNECTFROMFIELD, Field._ID)
                        .put(Mongo.CONNECTTOFIELD, Field.PARENTID)
                        .put(Mongo.AS, Field.CHILDREN)
                        .put(Mongo.RESTRICT_SEARCH_WITH_MATCH, new JsonObject().put(Field.OWNERID, ownerId))
                )
                .project(new JsonObject()
                        .put(Field.CHILDRENIDS, String.format("$%s.%s", Field.CHILDREN, Field._ID)))
                .getAggregate();

        Promise<List<String>> promise = Promise.promise();

        mongoDb.command(query.toString(), MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolderChildrenIds] Failed to get folder children ids",
                        this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonArray result = results.right().getValue()
                    .getJsonObject(Mongo.CURSOR, new JsonObject())
                    .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());

            List<String> childrenFolderIds = ((List<JsonObject>) result.getList()).stream().flatMap(r -> {
                List<String> childrenIds = (r.getJsonArray(Field.CHILDRENIDS, new JsonArray())).getList();
                childrenIds.add(r.getString(Field._ID));
                return childrenIds.stream();
            }).collect(Collectors.toList());


            promise.complete(childrenFolderIds);
        }));

        return promise.future();
    }

    @Override
    public Future<JsonObject> moveBoardsToFolder(String userId, List<String> boardIds, String folderId) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> oldFolderSharedRights = this.getOldFolderSharedRights(boardIds);
        Future<JsonArray> newFolderSharedRights = (folderId == null || folderId.equals(Field.MY_BOARDS))
                ? Future.succeededFuture(new JsonArray())
                : this.getFolderSharedRights(folderId);

        JsonArray oldFolderSharedRightsList = new JsonArray();
        List<SharedElem> newFolderSharedRightsList = new ArrayList<>();

        CompositeFuture.all(oldFolderSharedRights, newFolderSharedRights)
                .compose(rightsList -> {
                    oldFolderSharedRightsList.addAll(rightsList.resultAt(0));
                    newFolderSharedRightsList.addAll(ShareHelper.getSharedElem(rightsList.resultAt(1)));

                    return this.updateOldFolder(boardIds);
                })
                .compose(update -> {

                    Future<JsonObject> workspaceShareRights = this.serviceFactory.workSpaceService().setShareRights(boardIds, this.serviceFactory.shareService().getSharedJsonFromList(newFolderSharedRightsList));
                    Future<JsonObject> updateNewFolderFuture = this.updateNewFolder(boardIds, folderId);
                    Future<List<JsonObject>> handleBoardSharedRightsFuture = this.updateBoardsSharedRights(oldFolderSharedRightsList, newFolderSharedRightsList);

                    return CompositeFuture.all(updateNewFolderFuture, handleBoardSharedRightsFuture, workspaceShareRights);
                })
                .onFailure(error -> promise.fail(error.getMessage()))
                .onSuccess(result -> promise.complete(result.resultAt(1)));

        return promise.future();
    }

    private Future<JsonArray> getOldFolderSharedRights(List<String> boardIds) {
        Promise<JsonArray> promise = Promise.promise();
        List<Future<JsonObject>> handleBoardFutures = new ArrayList<Future<JsonObject>>();

        this.serviceFactory.boardService().getBoards(boardIds)
                .compose(boards -> {
                    boards.forEach(board -> handleBoardFutures.add(getOldFolderSharedRIghtsAndBoardId(board)));
                    return FutureHelper.all(handleBoardFutures);
                })
                .onSuccess(results -> {
                    JsonArray resultArray = new JsonArray();
                    results.list().forEach(resultArray::add);
                    promise.complete(resultArray);
                })
                .onFailure(error -> promise.fail(error.getMessage()));

        return promise.future();
    }

    private Future<JsonObject> getOldFolderSharedRIghtsAndBoardId(Board board) {
        Promise<JsonObject> promise = Promise.promise();

        Future<JsonArray> oldFolderSharedRights = (board.getFolderId() != null && board.getFolderId().equals(Field.MY_BOARDS))
                ? Future.succeededFuture(new JsonArray())
                : this.getFolderByBoardId(board.getId()).compose(folder -> this.getFolderSharedRights(folder.getString(Field._ID, "")));

        oldFolderSharedRights
                .onFailure(error -> promise.fail(error.getMessage()))
                .onSuccess(rights -> promise.complete(new JsonObject().put(Field.BOARDID, board.getId()).put(Field.SHARED, rights)));

        return promise.future();
    }

    private Future<JsonArray> getFolderSharedRights(String folderId) {
        Promise<JsonArray> promise = Promise.promise();
        JsonObject query = new JsonObject()
                .put(Field._ID, folderId);

        mongoDb.findOne(this.collection, query, MongoDbResult.validResultHandler(results -> {
            if (results.isLeft()) {
                String message = String.format("[Magneto@%s::getFolderSharedRights] Failed to get folder", this.getClass().getSimpleName());
                log.error(String.format("%s : %s", message, results.left().getValue()));
                promise.fail(message);
                return;
            }

            JsonObject folderData = results.right().getValue();
            JsonArray folderSharedRights = folderData.getJsonArray(Field.SHARED, new JsonArray());

            promise.complete(folderSharedRights);
        }));
        return promise.future();
    }

    private Future<List<JsonObject>> updateBoardsSharedRights(JsonArray oldFolderSharedRightsList, List<SharedElem> newFolderSharedRightsList) {
        Promise<List<JsonObject>> promise = Promise.promise();
        List<Future<JsonObject>> updateBoardsSharedRightsFutures = new ArrayList<Future<JsonObject>>();


        oldFolderSharedRightsList
                .stream()
                .filter(JsonObject.class::isInstance)
                .map(JsonObject.class::cast)
                .forEach(oldRightAndBoardIdList -> updateBoardsSharedRightsFutures
                        .add(this.serviceFactory.shareService().upsertSharedArray(oldRightAndBoardIdList.getString(Field.BOARDID, ""),
                                newFolderSharedRightsList,
                                ShareHelper.removeCommonRights(ShareHelper.getSharedElem(oldRightAndBoardIdList.getJsonArray(Field.SHARED, new JsonArray())), newFolderSharedRightsList)
                                , CollectionsConstant.BOARD_COLLECTION, true)));

        FutureHelper.all(updateBoardsSharedRightsFutures)
                .onSuccess(result -> promise.complete(result.resultAt(0)))
                .onFailure(promise::fail);

        return promise.future();
    }

    private Future<JsonObject> updateNewFolder(List<String> boardIds, String folderId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, folderId);
        JsonObject update = new JsonObject().put(Mongo.PUSH,
                new JsonObject().put(Field.BOARDIDS, new JsonObject().put(Mongo.EACH, new JsonArray(boardIds))));

        mongoDb.update(this.collection, query, update, false, false,
                MongoDbResult.validActionResultHandler(results -> {
                    if (results.isLeft()) {
                        String message = String.format("[Magneto@%s::updateNewFolder] Failed to move boards to folder",
                                this.getClass().getSimpleName());
                        log.error(String.format("%s : %s", message, results.left().getValue()));
                        promise.fail(message);
                        return;
                    }
                    promise.complete(results.right().getValue());
                }));
        return promise.future();
    }
    private Future<JsonObject> setBoardsIds(List<String> boardIds, String folderId) {
        Promise<JsonObject> promise = Promise.promise();

        JsonObject query = new JsonObject()
                .put(Field._ID, folderId);
        JsonObject update = new JsonObject().put(Mongo.SET,
                new JsonObject().put(Field.BOARDIDS, new JsonArray(boardIds)));

        mongoDb.update(this.collection, query, update, false, false,
                MongoDbResult.validActionResultHandler(results -> {
                    if (results.isLeft()) {
                        String message = String.format("[Magneto@%s::setBoardsIds] Failed to set boardsId to folder",
                                this.getClass().getSimpleName());
                        log.error(String.format("%s : %s", message, results.left().getValue()));
                        promise.fail(message);
                        return;
                    }
                    promise.complete(results.right().getValue());
                }));
        return promise.future();
    }

    @Override
    public Future<JsonObject> updateOldFolder(List<String> boardIds) {
        Promise<JsonObject> promise = Promise.promise();
        if (boardIds.isEmpty())
            promise.complete(new JsonObject());
        else {
            JsonObject query = new JsonObject()
                    .put(Field.BOARDIDS, new JsonObject().put(Mongo.ELEMMATCH, new JsonObject().put(Mongo.IN,
                            new JsonArray(java.util.Collections.singletonList(boardIds.get(0))))));

            JsonObject update = new JsonObject().put(Mongo.PULL, new JsonObject().put(Field.BOARDIDS,
                    new JsonObject().put(Mongo.IN, new JsonArray(boardIds))));

            mongoDb.update(this.collection, query, update, false, false,
                    MongoDbResult.validActionResultHandler(results -> {
                        if (results.isLeft()) {
                            String message = String.format("[Magneto@%s::updateOldFolder] Failed to update old folder",
                                    this.getClass().getSimpleName());
                            log.error(String.format("%s : %s", message, results.left().getValue()));
                            promise.fail(message);
                            return;
                        }
                        promise.complete(results.right().getValue());
                    }));

        }
        return promise.future();
    }

    @Override
    public Future<JsonObject> getFolderByBoardId(String boardId) {
        Promise<JsonObject> promise = Promise.promise();
        MongoQuery query = new MongoQuery(this.collection);
        query.match(new JsonObject().put(Field.BOARDIDS, new JsonObject().put(Mongo.IN, new JsonArray().add(boardId))));
        mongoDb.command(query.getAggregate().toString(), MongoDbResult.validResultHandler(resultMongo -> {
            if (resultMongo.isRight()) {
                JsonArray resultJsonArray = resultMongo.right().getValue()
                        .getJsonObject(Mongo.CURSOR, new JsonObject())
                        .getJsonArray(Mongo.FIRSTBATCH, new JsonArray());
                if (!resultJsonArray.isEmpty()) {
                    JsonObject result = resultJsonArray
                            .getJsonObject(0);
                    promise.complete(result);
                } else {
                    promise.complete(new JsonObject());
                }
            }
        }));
        return promise.future();
    }

    @Override
    public Future<List<String>> getChildrenBoardsIds(String id) {
        Promise<List<String>> promise = Promise.promise();

        List<String> ids = new ArrayList<>();
        ids.add(id);
        getFolderChildrenIds(ids)
                .compose(this::getBoardIdsInFolders)
                .onSuccess(promise::complete)
                .onFailure(error -> {
                    String message = String.format("[Magneto@%s::getChildrenBoardsIds] Failed to recovers boards and folders ids",
                            this.getClass().getSimpleName());
                    log.error(String.format("%s : %s", message, error));
                    promise.fail(message);
                });
        return promise.future();
    }

    @Override
    public Future<Void> shareFolder(String id, List<SharedElem> newShares, List<SharedElem> deletedShares) {
        List<String> ids = new ArrayList<>();
        ids.add(id);
        Promise<Void> promise = Promise.promise();
        List<Future<JsonObject>> futures = new ArrayList<>();

        futures.add(serviceFactory.shareService().upsertSharedArray(id, newShares, deletedShares, this.collection, false));

        getFolderChildrenIds(ids).onSuccess(foldersIds ->
                foldersIds.forEach(folderId -> {
                            if (!folderId.equals(id))
                                futures.add(serviceFactory.shareService().upsertSharedArray(folderId, newShares, deletedShares, this.collection, true));
                        }
                ));

        FutureHelper.all(futures)
                .onSuccess(success -> promise.complete())
                .onFailure(error -> promise.fail(error.getMessage()));

        return promise.future();
    }
}

