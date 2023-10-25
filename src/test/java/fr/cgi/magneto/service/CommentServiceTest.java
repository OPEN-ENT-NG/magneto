package fr.cgi.magneto.service;

import fr.cgi.magneto.service.impl.*;
import fr.wseduc.mongodb.*;
import io.vertx.core.*;
import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;
import org.mockito.*;
import org.powermock.reflect.*;

@RunWith(VertxUnitRunner.class)
public class CommentServiceTest {
    private Vertx vertx;

    MongoDb mongoDb = Mockito.mock(MongoDb.class);

    private CommentService commentService;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        this.commentService = new DefaultCommentService("card", mongoDb);
    }

    @Test
    public void testgetAllCommentsQuery(TestContext ctx)  throws Exception {
        JsonObject expected = new JsonObject(
                "{\"aggregate\":\"card\",\n" +
                        "   \"allowDiskUse\":true,\n" +
                        "   \"cursor\":{\n" +
                        "      \"batchSize\":2147483647\n" +
                        "   },\n" +
                        "   \"pipeline\":[\n" +
                        "      {\n" +
                        "         \"$match\":{\n" +
                        "           \"_id\":\"id\"}\n" +
                        "       }\n" +
                        "       ,{\n" +
                        "           \"$unwind\":{\n" +
                        "           \"path\":\"$comments\",\n" +
                        "           \"preserveNullAndEmptyArrays\":false\n" +
                        "       }\n" +
                        "},\n" +
                        "{\"$project\":{\n" +
                        "   \"_id\":\"$comments._id\",\n" +
                        "   \"ownerId\":\"$comments.ownerId\",\n" +
                        "   \"ownerName\":\"$comments.ownerName\",\n" +
                        "   \"content\":\"$comments.content\",\n" +
                        "   \"creationDate\":\"$comments.creationDate\",\n" +
                        "   \"modificationDate\":\"$comments.modificationDate\"\n" +
                        "}\n" +
                "},\n" +
                        "{\"$skip\":400},\n" +
                        "{\"$limit\":30}]}");


            JsonObject query = Whitebox.invokeMethod(commentService, "getAllCommentsQuery", "id", 30);

            ctx.assertEquals(expected, query);
    }
}
