package fr.cgi.magneto.service;

import fr.cgi.magneto.core.constants.Collections;
import fr.cgi.magneto.service.impl.DefaultBoardService;
import fr.cgi.magneto.service.impl.DefaultCardService;
import fr.cgi.magneto.service.impl.DefaultFolderService;
import fr.cgi.magneto.service.impl.DefaultMagnetoService;
import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.service.impl.*;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;

public class ServiceFactory {
    private final Vertx vertx;
    private final Storage storage;
    private final Neo4j neo4j;
    private final Sql sql;
    private final MongoDb mongoDb;
    private final MagnetoConfig magnetoConfig;

    public ServiceFactory(Vertx vertx, Storage storage, MagnetoConfig magnetoConfig, Neo4j neo4j, Sql sql, MongoDb mongoDb) {
        this.vertx = vertx;
        this.storage = storage;
        this.magnetoConfig = magnetoConfig;
        this.neo4j = neo4j;
        this.sql = sql;
        this.mongoDb = mongoDb;
    }

    public MagnetoService magnetoServiceExample() {
        return new DefaultMagnetoService();
    }

    public MagnetoConfig magnetoConfig() {
        return this.magnetoConfig;
    }

    public BoardService boardService() {
        return new DefaultBoardService(Collections.BOARD_COLLECTION, mongoDb);
    }

    public CardService cardService() {
        return new DefaultCardService(Collections.CARD_COLLECTION, mongoDb, this);
    }

    public FolderService folderService() {
        return new DefaultFolderService(Collections.FOLDER_COLLECTION, mongoDb);
    }

    public WorkspaceService workSpaceService() {
        return new DefaultWorkspaceService(vertx);
    }

    // Helpers
    public EventBus eventBus() {
        return this.vertx.eventBus();
    }

    public Vertx vertx() {
        return this.vertx;
    }
}
