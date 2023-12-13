package fr.cgi.magneto.service;

import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.service.impl.*;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.net.*;
import io.vertx.ext.web.client.*;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;

public class ServiceFactory {
    private final Vertx vertx;
    private final Storage storage;
    private final Neo4j neo4j;
    private final Sql sql;
    private final MongoDb mongoDb;

    private final WebClient webClient;
    private final MagnetoConfig magnetoConfig;

    private final FolderService folderService;
    private final BoardService boardService;
    private final CardService cardService;

    public ServiceFactory(Vertx vertx, Storage storage, MagnetoConfig magnetoConfig, Neo4j neo4j, Sql sql, MongoDb mongoDb) {
        this.vertx = vertx;
        this.storage = storage;
        this.magnetoConfig = magnetoConfig;
        this.neo4j = neo4j;
        this.sql = sql;
        this.mongoDb = mongoDb;
        this.webClient = initWebClient();
        this.folderService = new DefaultFolderService(CollectionsConstant.FOLDER_COLLECTION, mongoDb, this);
        this.cardService = new DefaultCardService(CollectionsConstant.CARD_COLLECTION, mongoDb, this);
        this.boardService = new DefaultBoardService(CollectionsConstant.BOARD_COLLECTION, mongoDb, this);
    }

    public MagnetoService magnetoServiceExample() {
        return new DefaultMagnetoService();
    }

    public MagnetoConfig magnetoConfig() {
        return this.magnetoConfig;
    }

    public BoardService boardService() {
        return this.boardService;
    }

    public UserService userService() {
        return new DefaultUserService();
    }

    public CardService cardService() {
        return this.cardService;
    }

    public SectionService sectionService() {
      return new DefaultSectionService(CollectionsConstant.SECTION_COLLECTION, mongoDb, this);
    }

    public FolderService folderService() {
        return this.folderService;
    }
    public WorkspaceService workSpaceService() {
        return new DefaultWorkspaceService(vertx, mongoDb);
    }

    public CommentService commentService() {
        return new DefaultCommentService(CollectionsConstant.CARD_COLLECTION, mongoDb);
    }
    public BoardAccessService boardViewService(){
        return new DefaultBoardAccessService(CollectionsConstant.BOARD_VIEW_COLLECTION,mongoDb);
    }
    // Helpers
    public EventBus eventBus() {
        return this.vertx.eventBus();
    }

    public Vertx vertx() {
        return this.vertx;
    }

    public Storage storage() {
        return this.storage;
    }

    public WebClient webClient() {
        return this.webClient;
    }

    private WebClient initWebClient() {
        WebClientOptions options = new WebClientOptions();
        options.setTrustAll(true);
        if (System.getProperty("httpclient.proxyHost") != null) {
            ProxyOptions proxyOptions = new ProxyOptions();
            proxyOptions.setHost(System.getProperty("httpclient.proxyHost"));
            proxyOptions.setPort(Integer.parseInt(System.getProperty("httpclient.proxyPort")));
            proxyOptions.setUsername(System.getProperty("httpclient.proxyUsername"));
            proxyOptions.setPassword(System.getProperty("httpclient.proxyPassword"));
            proxyOptions.setType(ProxyType.HTTP);
            options.setProxyOptions(proxyOptions);
        }
        return WebClient.create(this.vertx, options);
    }

}
