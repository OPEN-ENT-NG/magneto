package fr.cgi.magneto.service;

import fr.cgi.magneto.config.MagnetoConfig;
import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.realtime.DefaultMagnetoCollaborationService;
import fr.cgi.magneto.realtime.MagnetoCollaborationService;
import fr.cgi.magneto.service.impl.*;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.core.net.ProxyOptions;
import io.vertx.core.net.ProxyType;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.client.WebClientOptions;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.share.ShareNormalizer;
import org.entcore.common.share.impl.MongoDbShareService;
import org.entcore.common.sql.Sql;
import org.entcore.common.storage.Storage;

import java.util.Map;

public class ServiceFactory {
    private final Vertx vertx;
    private final Storage storage;
    private final Neo4j neo4j;
    private final Sql sql;
    private final MongoDb mongoDb;
    private final JsonObject config;

    private final WebClient webClient;
    private final MagnetoConfig magnetoConfig;

    private final FolderService folderService;
    private final BoardService boardService;
    private final CardService cardService;
    private final ExportService exportService;
    private final PDFExportService pdfExportService;
    private final MagnetoCollaborationService magnetoCollaborationService;
    private final Map<String, SecuredAction> securedActions;
    private final ShareNormalizer shareNormalizer;

    public ServiceFactory(Vertx vertx, Storage storage, MagnetoConfig magnetoConfig, Neo4j neo4j, Sql sql, MongoDb mongoDb,
                          Map<String, SecuredAction> securedActions, JsonObject config) {
        this.vertx = vertx;
        this.storage = storage;
        this.magnetoConfig = magnetoConfig;
        this.neo4j = neo4j;
        this.sql = sql;
        this.mongoDb = mongoDb;
        this.securedActions = securedActions;
        this.config = config;
        this.webClient = initWebClient();
        this.shareNormalizer = new ShareNormalizer(securedActions);
        this.folderService = new DefaultFolderService(CollectionsConstant.FOLDER_COLLECTION, mongoDb, this);
        this.cardService = new DefaultCardService(CollectionsConstant.CARD_COLLECTION, mongoDb, this);
        this.boardService = new DefaultBoardService(CollectionsConstant.BOARD_COLLECTION, mongoDb, this);
        this.exportService = new DefaultExportService(this);
        this.pdfExportService = new DefaultPDFExportService(this);
        this.magnetoCollaborationService = new DefaultMagnetoCollaborationService(this);

    }

    public MagnetoService magnetoServiceExample() {
        return new DefaultMagnetoService();
    }

    public MagnetoConfig magnetoConfig() {
        return this.magnetoConfig;
    }

    public ShareNormalizer shareNormalizer() {
        return this.shareNormalizer;
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

    public ExportService exportService() {
        return this.exportService;
    }

    public PDFExportService pdfExportService() {
        return this.pdfExportService;
    }

    public WorkspaceService workSpaceService() {
        return new DefaultWorkspaceService(vertx, mongoDb);
    }

    public CommentService commentService() {
        return new DefaultCommentService(CollectionsConstant.CARD_COLLECTION, mongoDb);
    }

    public MagnetoCollaborationService magnetoCollaborationService() {
        return this.magnetoCollaborationService;
    }

    public BoardAccessService boardViewService(){
        return new DefaultBoardAccessService(CollectionsConstant.BOARD_VIEW_COLLECTION,mongoDb);
    }

    public ShareService shareService() {
        return new DefaultShareService(mongoDb);
    }
    // Helpers
    public EventBus eventBus() {
        return this.vertx.eventBus();
    }

    public Vertx vertx() {
        return this.vertx;
    }

    public JsonObject config() {
        return this.config;
    }

    public Storage storage() {
        return this.storage;
    }

    public WebClient webClient() {
        return this.webClient;
    }

    public Map<String, SecuredAction> securedActions() {
        return this.securedActions;
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
    public MongoDbShareService mongoDbShareService(String collection){
        return new MongoDbShareService(this.eventBus(), MongoDb.getInstance(),
                collection, this.securedActions(), null);
    }
    public ShareBookMarkService shareBookMarkService(){
        return new DefaultShareBookMarkService(neo4j);
    }
}
