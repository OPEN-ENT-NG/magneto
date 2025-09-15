package fr.cgi.magneto;

import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.controller.*;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.service.ServiceFactory;
import fr.cgi.magneto.service.impl.MagnetoRepositoryEvents;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.http.HttpServerOptions;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.share.impl.MongoDbShareService;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;
import org.entcore.common.storage.StorageFactory;

public class Magneto extends BaseServer {
	// todo fix via NGNA-2988
	public static final Integer PAGE_SIZE = 163;

    @Override
    public void start(Promise<Void> startPromise) throws Exception {
        final Promise<Void> promise = Promise.promise();
        super.start(promise);
        promise.future().compose(e -> this.initMagneto());
    }
    
    public Future<Void> initMagneto() {
        return StorageFactory.build(vertx, config)
            .compose(storageFactory -> {
                final Storage storage = storageFactory.getStorage();
                MagnetoConfig magnetoConfig = new MagnetoConfig(config);
                ServiceFactory serviceFactory = new ServiceFactory(vertx, storage, magnetoConfig, Neo4j.getInstance(), Sql.getInstance(), MongoDb.getInstance(), securedActions, config);

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

                final HttpServerOptions options = new HttpServerOptions().setMaxWebSocketFrameSize(1024 * 1024);
                vertx.createHttpServer(options)
                        .webSocketHandler(new MagnetoCollaborationController(serviceFactory, magnetoConfig.getMagnetoWebsocketMaxUsers(), magnetoConfig.getMagnetoWebsocketMaxUsersPerBoard(), config))
                        .listen(magnetoConfig.getMagnetoWebsocketPort(), asyncResult -> {
                            if(asyncResult.succeeded()) {
                                log.info("Websocket server started and listening on port " + magnetoConfig.getMagnetoWebsocketPort());
                            } else {
                                log.error("Cannot start websocket controller", asyncResult.cause());
                            }
                        });
                return Future.succeededFuture();
            });
    }
}
