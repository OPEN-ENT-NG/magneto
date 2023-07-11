package fr.cgi.magneto.service.impl;

import com.mongodb.QueryBuilder;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.constants.Mongo;
import fr.cgi.magneto.helper.FutureHelper;
import fr.cgi.magneto.helper.ImportExportHelper;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.*;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.folders.impl.DocumentHelper;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class MagnetoRepositoryEvents extends MongoDbRepositoryEvents {

    protected static final Logger log = LoggerFactory.getLogger(MagnetoRepositoryEvents.class);

    public MagnetoRepositoryEvents(Vertx vertx) {
        super(vertx);
        this.collectionNameToImportPrefixMap.put(CollectionsConstant.FOLDER_COLLECTION, Field.FOLDER);
        this.collectionNameToImportPrefixMap.put(CollectionsConstant.BOARD_COLLECTION, Field.BOARD);
        this.collectionNameToImportPrefixMap.put(CollectionsConstant.CARD_COLLECTION, Field.CARD);
        this.collectionNameToImportPrefixMap.put(CollectionsConstant.SECTION_COLLECTION, Field.SECTION);
    }

    /**
     * Find all documents in a collection based on a specific query
     *
     * @param collection the collection to search in
     * @param query      the query to use
     * @return a future with the results
     */
    public Future<JsonArray> findInCollection(String collection, JsonObject query) {
        Promise<JsonArray> promise = Promise.promise();
        mongo.find(collection, query, event -> {
            JsonArray results = event.body().getJsonArray(Field.RESULTS);
            if (Field.OK.equals(event.body().getString(Field.STATUS)) && results != null) {
                promise.complete(results);
            } else {
                promise.fail("Could not process query" + query.encodePrettily());
            }
        });
        return promise.future();
    }

    /**
     * Find all sections for a list of boards (based on their ids)
     *
     * @param boardsFuture the future with the boards
     * @return a future with the sections
     */
    private Future<JsonArray> findInSections(Future<JsonArray> boardsFuture) {
        Promise<JsonArray> promise = Promise.promise();
        List<String> boardIds = new ArrayList<>();
        boardsFuture.onSuccess(boards -> {
            boards.stream().map(JsonObject.class::cast).forEach(board -> boardIds.add(board.getString(Field._ID)));

            JsonObject query = new JsonObject()
                    .put(Field.BOARDID, new JsonObject().put(Mongo.IN, boardIds));

            mongo.find(CollectionsConstant.SECTION_COLLECTION, query, res -> {
                JsonArray results = res.body().getJsonArray(Field.RESULTS);
                if (Field.OK.equals(res.body().getString(Field.STATUS)) && results != null) {
                    promise.complete(results);
                } else {
                    promise.fail("Could not process query" + query.encodePrettily());
                }
            });
        });
        return promise.future();
    }


    private void addResultsWithPrefix(JsonArray results, JsonArray collectionResults, String prefix) {
        collectionResults.forEach(item -> ((JsonObject) item).put(Field.TITLE, prefix + "_" + ((JsonObject) item).getString(Field.TITLE)));
        results.addAll(collectionResults);
    }

    /**
     * function called when the user wants to export resources
     *
     * @param resourcesIds          the ids of the resources to export (if null, all resources will be exported)
     * @param exportDocuments       if true, the workspace documents will be exported
     * @param exportSharedResources if true, the shared resources will be exported
     * @param exportId              the id of the export (used to create the zip file)
     * @param userId                the id of the user who wants to export the resources
     * @param groups                the groups of the user who wants to export the resources
     * @param exportPath            the path where the zip file will be created
     * @param locale                the language of the user who wants to export the resources
     * @param host                  the host of the user who wants to export the resources
     * @param handler               the handler to call when the export is done
     */
    @Override
    public void exportResources(JsonArray resourcesIds, final boolean exportDocuments, boolean exportSharedResources, String exportId, String userId, JsonArray groups, final String exportPath, final String locale, String host, final Handler<Boolean> handler) {
        QueryBuilder findByAuthor = QueryBuilder.start(Field.OWNERID).is(userId);
        QueryBuilder findByShared = QueryBuilder.start().or(
                QueryBuilder.start(Field.SHARED_USERID).is(userId).get(),
                QueryBuilder.start(Field.SHARED_GROUPID).in(groups).get()
        );
        QueryBuilder findByAuthorOrShared = !exportSharedResources ? findByAuthor : QueryBuilder.start().or(findByAuthor.get(), findByShared.get());
        JsonObject query;

        if (resourcesIds == null)
            query = MongoQueryBuilder.build(findByAuthorOrShared);
        else {
            QueryBuilder limitToResources = findByAuthorOrShared.and(
                    QueryBuilder.start(Field._ID).in(resourcesIds).get()
            );
            query = MongoQueryBuilder.build(limitToResources);
        }

        AtomicBoolean exported = new AtomicBoolean();
        Map<String, String> prefixMap = this.collectionNameToImportPrefixMap;

        // find all resources to export
        Future<JsonArray> foldersFuture = findInCollection(CollectionsConstant.FOLDER_COLLECTION, query);
        Future<JsonArray> boardsFuture = findInCollection(CollectionsConstant.BOARD_COLLECTION, query);
        Future<JsonArray> cardsFuture = findInCollection(CollectionsConstant.CARD_COLLECTION, query);
        Future<JsonArray> sectionsFuture = findInSections(boardsFuture);

        CompositeFuture.all(foldersFuture, boardsFuture, sectionsFuture, cardsFuture).onSuccess(res -> {
            JsonArray exportResults = new JsonArray();

            // add the prefix to the title of the resources
            addResultsWithPrefix(exportResults, foldersFuture.result(), prefixMap.get(CollectionsConstant.FOLDER_COLLECTION));
            addResultsWithPrefix(exportResults, boardsFuture.result(), prefixMap.get(CollectionsConstant.BOARD_COLLECTION));
            addResultsWithPrefix(exportResults, sectionsFuture.result(), prefixMap.get(CollectionsConstant.SECTION_COLLECTION));
            addResultsWithPrefix(exportResults, cardsFuture.result(), prefixMap.get(CollectionsConstant.CARD_COLLECTION));
            // create the zip file
            createExportDirectory(exportPath, locale, path -> {
                if (path != null) {
                    exportFiles(exportResults, path, new HashSet<>(), exported, handler);
                    if (exportDocuments) {
                        exportDocumentsDependancies(exportResults, path, handler);
                    } else {
                        handler.handle(Boolean.TRUE);
                    }
                } else {
                    handler.handle(exported.get());
                }
            });
        }).onFailure(error -> {
            log.error("Could not process query" + query.encodePrettily(), error.getCause().getMessage());
            handler.handle(exported.get());
        });
    }


    /**
     * @param importId                 the id of the import
     * @param userId                   the id of the user who wants to import the resources
     * @param userLogin                the login of the user who wants to import the resources
     * @param userName                 the name of the user who wants to import the resources
     * @param importPath               the path where the zip file is located
     * @param locale                   the language of the user who wants to import the resources
     * @param host                     the host of the user who wants to import the resources
     * @param forceImportAsDuplication if true, the resources will be imported as duplications
     * @param handler                  the handler to call when the import is done
     */
    @Override
    public void importResources(final String importId, final String userId, final String userLogin, final String userName, String importPath, String locale, String host, boolean forceImportAsDuplication, final Handler<JsonObject> handler) {

        Map<String, String> prefixMap = this.collectionNameToImportPrefixMap;
        if (prefixMap.size() == 0) {
            prefixMap.put(MongoDbConf.getInstance().getCollection(), "");
        }
        Future<Map<String, List<JsonObject>>> documentsFromDirFuture = this.readAllDocumentsFromDirByCollection(importPath, userId, userName);
        //Map old ids and new ids for each document
        Future<Map<String, String>> newIdsMapFuture = documentsFromDirFuture.compose(result -> {
            //For each collection
            Map<String, String> newIds = new HashMap<>();
            //For each documents in this collection
            for (Map.Entry<String, List<JsonObject>> entry : result.entrySet()) {
                List<JsonObject> documents = entry.getValue();
                documents.forEach(document -> newIds.put(DocumentHelper.getId(document), UUID.randomUUID().toString()));
            }
            return Future.succeededFuture(newIds);
        });
        CompositeFuture.all(documentsFromDirFuture, newIdsMapFuture).onSuccess(compositeFuture -> {
            Map<String, List<JsonObject>> documentsByCollection = compositeFuture.resultAt(0);
            Map<String, String> oldIdsNewIdsMap = compositeFuture.resultAt(1);



            //Array if all old ids (used to check duplicates)
            JsonArray oldIds = new JsonArray();
            oldIdsNewIdsMap.keySet().forEach(oldIds::add);


            //Update all documents with new ids
            documentsByCollection.values().forEach(documents -> documents.forEach(document -> applyIdsChange(document, oldIdsNewIdsMap)));

            List<Future<JsonObject>> futures = new ArrayList<>();

            //Insert all documents in the database by collection
            for (Map.Entry<String, String> prefix : prefixMap.entrySet()) {
                Future<JsonObject> future = insertDocuments(prefix.getKey(), documentsByCollection.get(prefix.getKey()), oldIds, userId);
                futures.add(future);
            }

            FutureHelper.all(futures).onSuccess(rapportsResultsFuture -> {
                //Create a final rapport with all rapports
                List<JsonObject> rapports = (rapportsResultsFuture.result()).list();

                Integer nbResources = rapports.stream()
                        .map(rapport -> Integer.valueOf(rapport.getJsonObject(Field.RAPPORT).getString(Field.RESSOURCE_NUMBER)))
                        .reduce(0, Integer::sum);

                Integer nbDuplicates = rapports.stream()
                        .map(rapport -> Integer.valueOf(rapport.getJsonObject(Field.RAPPORT).getString(Field.DUPLICATES_NUMBER)))
                        .reduce(0, Integer::sum);

                Integer nbErrors = rapports.stream()
                        .map(rapport -> Integer.valueOf(rapport.getJsonObject(Field.RAPPORT).getString(Field.ERRORS_NUMBER)))
                        .reduce(0, Integer::sum);

                JsonObject finalRapport =
                        new JsonObject()
                                .put(Field.RESSOURCE_NUMBER, Integer.toString(nbResources))
                                .put(Field.DUPLICATES_NUMBER, Integer.toString(nbDuplicates))
                                .put(Field.ERRORS_NUMBER, Integer.toString(nbErrors))
                                .put(Field.RESSOURCE_IDS_MAP, new JsonObject())
                                .put(Field.DUPLICATES_NUMBER_MAP, new JsonObject())
                                .put(Field.MAIN_RESSOURCE_NAME, "");
                handler.handle(finalRapport);
            }).onFailure(error -> {
                log.error("Could not process query", error.getCause().getMessage());
                handler.handle(new JsonObject().put(Field.STATUS, Field.ERROR).put(Field.MESSAGE, error.getCause().getMessage()));
            });
        });
    }

    /**
     * @param insertBody the body of the insert request
     * @param ressourceNumber the number of resources inserted
     * @return the number of errors in the insert request
     */
    private int calculateErrorCount(JsonObject insertBody, int ressourceNumber) {
        if (Field.OK.equals(insertBody.getString(Field.STATUS))) {
            return 0;
        } else {
            JsonObject mongoError = new JsonObject(insertBody.getString(Field.MESSAGE));
            return ressourceNumber - mongoError.getInteger("n");
        }
    }

    /**
     * @param foundDocs the documents found in the database
     * @param oldIds   the old ids of the documents
     * @return the number of duplicates
     */
    private int countDuplicates(JsonArray foundDocs, JsonArray oldIds) {
        int nbDuplicates = 0;
        for (int i = foundDocs.size(); i-- > 0; ) {
            String foundId = DocumentHelper.getId(foundDocs.getJsonObject(i));
            if (oldIds.contains(foundId)) {
                nbDuplicates++;
            }
        }
        return nbDuplicates;
    }


    /**
     * Insert documents in the database based on the collection and return a rapport
     *
     * @param collection            the collection where the documents will be inserted
     * @param collectionDocuments   the documents to insert
     * @param oldIds                the old ids of the documents
     * @return a future containing the rapport
     */
    protected Future<JsonObject> insertDocuments(String collection, List<JsonObject> collectionDocuments, JsonArray oldIds, String ownerId) {
        Promise<JsonObject> promise = Promise.promise();

        if (collectionDocuments.isEmpty()) {
            JsonObject rapport = ImportExportHelper.createEmptyRapport(collection);
            promise.complete(rapport);
            return promise.future();
        }

        //Check for duplicates
        QueryBuilder lookForExisting = QueryBuilder.start()
                .and(Field._ID).in(oldIds)
                .and(Field.OWNERID).is(ownerId);

        mongo.find(collection, MongoQueryBuilder.build(lookForExisting), searchMsg -> {
            JsonObject body = searchMsg.body();

            if (body.getString(Field.STATUS).equals(Field.OK)) {
                JsonArray foundDocs = body.getJsonArray(Field.RESULTS);

                //Find number of duplicate object in this import
                final int finalNbDuplicates = countDuplicates(foundDocs, oldIds);
                JsonArray documentsToInsert = new JsonArray();
                collectionDocuments.forEach(documentsToInsert::add);
                int ressourceNumber = collectionDocuments.size();

                // Import data into the database
                mongo.insert(collection, documentsToInsert, insertMsg -> {
                    int nbErrors = calculateErrorCount(insertMsg.body(), ressourceNumber);
                    JsonObject rapport = ImportExportHelper.createRapport(collection, ressourceNumber, finalNbDuplicates, nbErrors);
                    promise.complete(rapport);
                });
            } else {
                JsonObject rapport = ImportExportHelper.createErrorRapport(collection, collectionDocuments.size());
                promise.complete(rapport);
            }
        });

        return promise.future();
    }


    /** Read all documents from a directory and return a map of collection name and list of documents
     * @param dirPath the path of the directory
     * @param userId the user id
     * @param userName the username
     * @return a future containing a map of collection name and list of documents
     */
    public Future<Map<String, List<JsonObject>>> readAllDocumentsFromDirByCollection(String dirPath, String userId, String userName) {
        final Promise<Map<String, List<JsonObject>>> promise = Promise.promise();
        super.readAllDocumentsFromDir(dirPath, userId, userName)
                .onSuccess(stringJsonObjectMap -> {
                    Map<String, List<JsonObject>> collectionDocumentsListMap = new HashMap<>();
                    this.collectionNameToImportPrefixMap.forEach((collection, prefix) -> {
                        List<JsonObject> documents = new ArrayList<>();
                        stringJsonObjectMap.forEach((fileName, document) -> {
                            if (fileName != null && document != null && fileName.startsWith(prefix)) {
                                //sanitise Document
                                ImportExportHelper.revertExportChanges(document, prefix, userId, userName);
                                documents.add(document);
                            }
                        });

                        collectionDocumentsListMap.put(collection, documents);
                    });
                    promise.complete(collectionDocumentsListMap);
                })
                .onFailure(promise::fail);
        return promise.future();
    }
}
