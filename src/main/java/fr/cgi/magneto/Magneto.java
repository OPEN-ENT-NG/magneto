package fr.cgi.magneto;

import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.controller.*;
import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.realtime.RealTimeCollaboration;
import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.mongodb.MongoDb;
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
	public static final Integer PAGE_SIZE = 20;

	@Override
	public void start() throws Exception {
		super.start();

		Storage storage = new StorageFactory(vertx, config).getStorage();
		MagnetoConfig magnetoConfig = new MagnetoConfig(config);
		ServiceFactory serviceFactory = new ServiceFactory(vertx, storage, magnetoConfig, Neo4j.getInstance(), Sql.getInstance(), MongoDb.getInstance());

		final MongoDbConf conf = MongoDbConf.getInstance();
		conf.setCollection(CollectionsConstant.BOARD_COLLECTION);
		conf.setResourceIdLabel(Field._ID);

		// TODO see if needed
		setDefaultResourceFilter(new ShareAndOwner());

		addController(new MagnetoController(serviceFactory));
		addController(new BoardController(serviceFactory));
		addController(new CardController(serviceFactory));
		addController(new FolderController(serviceFactory));
		addController(new SectionController(serviceFactory));
		addController(new StatisticController(serviceFactory));
		addController(new AuthController(serviceFactory));
		addController(new CommentController(serviceFactory));

		final EventBus eb = getEventBus(vertx);

		ShareBoardController shareBoardController = new ShareBoardController();
		addController(shareBoardController);
		shareBoardController.setShareService(new MongoDbShareService(eb, MongoDb.getInstance(),
				CollectionsConstant.BOARD_COLLECTION, securedActions, null));
		shareBoardController.setCrudService(new MongoDbCrudService(CollectionsConstant.BOARD_COLLECTION));

		// TODO Websocket
		// new RealTimeCollaboration(vertx, magnetoConfig).initRealTime();
	}
}
