package fr.cgi.magneto.service;

import fr.cgi.magneto.service.impl.DefaultBoardService;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.entcore.common.user.UserInfos;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.powermock.reflect.Whitebox;

import java.util.HashMap;
import java.util.Map;

@RunWith(VertxUnitRunner.class)
public class BoardServiceTest {
    private Vertx vertx;
    MongoDb mongoDb = Mockito.mock(MongoDb.class);

    private BoardService boardService;
    private ServiceFactory serviceFactory;

    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        Map<String, SecuredAction> securedActions = new HashMap<>();
        this.serviceFactory = new ServiceFactory(vertx, null, null, null, null, mongoDb, securedActions, new JsonObject());
        this.boardService = new DefaultBoardService("board", mongoDb, serviceFactory);
    }

    @Test
    public void testGetAllBoardsQuery(TestContext ctx) throws Exception {
       JsonObject expected = new JsonObject("{\n" +
               "   \"aggregate\":\"board\",\n" +
               "   \"allowDiskUse\":true,\n" +
               "   \"cursor\":{\n" +
               "      \"batchSize\":2147483647\n" +
               "   },\n" +
               "   \"pipeline\":[\n" +
               "      {\n" +
               "         \"$match\":{\n" +
               "            \"deleted\":false\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$match\":{\n" +
               "            \"$or\":[\n" +
               "               {\n" +
               "                  \"ownerId\":\"ownerId\"\n" +
               "               },\n" +
               "               {\n" +
               "                  \"shared.userId\":{\n" +
               "                     \"$in\":[\n" +
               "                        \"ownerId\"\n" +
               "                     ]\n" +
               "                  }\n" +
               "               },\n" +
               "               {\n" +
               "                  \"shared.groupId\":{\n" +
               "                     \"$in\":null\n" +
               "                  }\n" +
               "               }\n" +
               "            ]\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$match\":{\n" +
               "            \"$or\":[\n" +
               "               {\n" +
               "                  \"title\":{\n" +
               "                     \"$regex\":\"test\",\n" +
               "                     \"$options\":\"i\"\n" +
               "                  }\n" +
               "               },\n" +
               "               {\n" +
               "                  \"description\":{\n" +
               "                     \"$regex\":\"test\",\n" +
               "                     \"$options\":\"i\"\n" +
               "                  }\n" +
               "               },\n" +
               "               {\n" +
               "                  \"tags\":{\n" +
               "                     \"$regex\":\"test\",\n" +
               "                     \"$options\":\"i\"\n" +
               "                  }\n" +
               "               }\n" +
               "            ]\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$sort\":{\n" +
               "            \"name\":-1\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$lookup\":{\n" +
               "            \"from\":\"magneto.folders\",\n" +
               "            \"localField\":\"_id\",\n" +
               "            \"foreignField\":\"boardIds\",\n" +
               "            \"as\":\"folders\"\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$lookup\":{\n" +
               "            \"from\":\"magneto.sections\",\n" +
               "            \"localField\":\"sectionIds\",\n" +
               "            \"foreignField\":\"_id\",\n" +
               "            \"as\":\"sections\"\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$addFields\":{\n" +
               "            \"nbCardsSections\":{\n" +
               "               \"$sum\":{\n" +
               "                  \"$map\":{\n" +
               "                     \"input\":\"$sections\",\n" +
               "                     \"as\":\"section\",\n" +
               "                     \"in\":{\n" +
               "                        \"$size\":\"$$section.cardIds\"\n" +
               "                     }\n" +
               "                  }\n" +
               "               }\n" +
               "            }\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$project\":{\n" +
               "            \"_id\":1,\n" +
               "            \"title\":1,\n" +
               "            \"imageUrl\":1,\n" +
               "            \"backgroundUrl\":1,\n" +
               "            \"canComment\":1,\n" +
               "            \"isLocked\":1,\n" +
               "            \"isExternal\":1,\n" +
               "            \"displayNbFavorites\":1,\n" +
               "            \"nbCards\":1,\n" +
               "            \"nbCardsSections\":1,\n" +
               "            \"modificationDate\":1,\n" +
               "            \"folderId\":\"$folderId._id\",\n" +
               "            \"description\":1,\n" +
               "            \"ownerId\":1,\n" +
               "            \"ownerName\":1,\n" +
               "            \"shared\":1,\n" +
               "            \"tags\":1,\n" +
               "            \"layoutType\":1,\n" +
               "            \"public\":1\n" +
               "         }\n" +
               "      },\n" +
               "      {\n" +
               "         \"$count\":\"count\"\n" +
               "      }\n" +
               "   ]\n" +
               "}");

        UserInfos testUser = new UserInfos();
        testUser.setUserId("ownerId");

        JsonObject query = Whitebox.invokeMethod(this.boardService, "getAllBoardsQuery", testUser, 0, "test", "folderId",
                false, true, false, false, "name", true, false);

        ctx.assertEquals(expected, query);
    }



}
