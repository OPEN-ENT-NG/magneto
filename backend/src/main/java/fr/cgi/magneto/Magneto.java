package fr.cgi.magneto;

import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.controller.*;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.impl.MagnetoRepositoryEvents;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.*;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.*;
import org.entcore.common.mongodb.*;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.service.impl.*;
import org.entcore.common.share.impl.*;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;

public class Magneto extends BaseServer {
	// todo fix via NGNA-2988
	public static final Integer PAGE_SIZE = 163;

    @Override
    public void start(Promise<Void> startPromise) throws Exception {
        super.start(startPromise);

        Storage storage = new StorageFactory(vertx, config).getStorage();
        MagnetoConfig magnetoConfig = new MagnetoConfig(config);
        ServiceFactory serviceFactory = new ServiceFactory(vertx, storage, magnetoConfig, Neo4j.getInstance(), Sql.getInstance(), MongoDb.getInstance(), securedActions);

        final MongoDbConf conf = MongoDbConf.getInstance();
        conf.setCollection(CollectionsConstant.BOARD_COLLECTION);
        conf.setResourceIdLabel(Field._ID);

        // TODO see if needed
        setDefaultResourceFilter(new ShareAndOwner());

        // Set RepositoryEvents implementation used to process events published for transition
        setRepositoryEvents(new MagnetoRepositoryEvents(vertx));

        addController(new MagnetoController(serviceFactory));
        addController(new BoardController(serviceFactory));
        addController(new CardController(serviceFactory));
        addController(new FolderController(serviceFactory));
        addController(new SectionController(serviceFactory));
        addController(new StatisticController(serviceFactory));
        addController(new AuthController(serviceFactory));
        addController(new CommentController(serviceFactory));
        addController(new BoardAccessController(serviceFactory));
        addController(new WorkspaceController(serviceFactory));
        addController(new ExportController(serviceFactory));

        final EventBus eb = getEventBus(vertx);

        ShareBoardController shareBoardController = new ShareBoardController(serviceFactory);
        addController(shareBoardController);
        shareBoardController.setShareService(new MongoDbShareService(eb, MongoDb.getInstance(),
                CollectionsConstant.BOARD_COLLECTION, securedActions, null));
        shareBoardController.setCrudService(new MongoDbCrudService(CollectionsConstant.BOARD_COLLECTION));
        startPromise.tryComplete();
        startPromise.tryFail("[Magneto@Magneto::start] Failed to start module Magneto.");

        // TODO Websocket
        // new RealTimeCollaboration(vertx, magnetoConfig).initRealTime();
    }
}
