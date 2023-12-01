package fr.cgi.magneto.service;

import fr.cgi.magneto.service.impl.DefaultBoardAccessService;
import fr.cgi.magneto.service.impl.DefaultCommentService;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.reflect.Whitebox;

@RunWith(VertxUnitRunner.class)
public class BoardAccessServiceTest {
    private Vertx vertx;

    MongoDb mongoDb = Mockito.mock(MongoDb.class);

    private BoardAccessService boardAccessService;
    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        this.boardAccessService = new DefaultBoardAccessService("magneto.boards.access", mongoDb);
    }
    @Test
    public void testgetLastAccess(TestContext ctx)  throws Exception {

        JsonObject expected = new JsonObject(
                "{\"aggregate\":\"magneto.boards.access\",\n" +
                        "   \"allowDiskUse\":true,\n" +
                        "   \"cursor\":{\n" +
                        "      \"batchSize\":2147483647\n" +
                        "   },\n" +
                        "   \"pipeline\":[\n" +
                        "      {\n" +
                        "         \"$match\":{\n" +
                        "           \"userId\":\"userId\"}\n" +
                        "},\n" +
                        "{\"$group\":{\"_id\":\"$boardId\",\"creationDate\":{\"$max\":\"$creationDate\"}}},\n" +
                        "{\"$sort\":{\"creationDate\":-1}},\n" +
                        "{\"$limit\":5}]}");


        JsonObject query = Whitebox.invokeMethod(boardAccessService, "getBoardAccessQuery", "userId");
        ctx.assertEquals(expected, query);
    }
}
