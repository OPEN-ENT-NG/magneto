package fr.cgi.magneto.service;

import fr.cgi.magneto.service.impl.DefaultCardService;
import fr.wseduc.mongodb.MongoDb;
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

@RunWith(VertxUnitRunner.class)
public class CardServiceTest {
    private Vertx vertx;
    MongoDb mongoDb = Mockito.mock(MongoDb.class);

    private ServiceFactory serviceFactory;
    private CardService cardService;


    @Before
    public void setUp() {
        vertx = Vertx.vertx();
        MongoDb.getInstance().init(vertx.eventBus(), "fr.cgi.magneto");
        this.serviceFactory = new ServiceFactory(vertx, null, null, null, null, null, null, new JsonObject());
        this.cardService = new DefaultCardService("card", mongoDb, serviceFactory);
    }
    @Test
    public void testGetAllCardsQuery(TestContext ctx) throws Exception {
        JsonObject expected = new JsonObject("{\n" +
                "   \"aggregate\":\"card\",\n" +
                "   \"allowDiskUse\":true,\n" +
                "   \"cursor\":{\n" +
                "      \"batchSize\":2147483647\n" +
                "   },\n" +
                "   \"pipeline\":[\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"boardId\":{\n" +
                "               \"$ne\":\"boardId\"\n" +
                "            }\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$lookup\":{\n" +
                "            \"from\":\"magneto.boards\",\n" +
                "            \"localField\":\"boardId\",\n" +
                "            \"foreignField\":\"_id\",\n" +
                "            \"as\":\"result\"\n" +
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
                "                  \"caption\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               },\n" +
                "               {\n" +
                "                  \"result.tags\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               },\n" +
                "               {\n" +
                "                  \"result.title\":{\n" +
                "                     \"$regex\":\"test\",\n" +
                "                     \"$options\":\"i\"\n" +
                "                  }\n" +
                "               }\n" +
                "            ]\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$addFields\":{\n" +
                "            \"isLiked\":{\n" +
                "               \"$cond\":{\n" +
                "                  \"if\":{\n" +
                "                     \"$isArray\":\"$favoriteList\"\n" +
                "                  },\n" +
                "                  \"then\":{\n" +
                "                     \"$setIsSubset\":[\n" +
                "                        [\n" +
                "                           \"ownerId\"\n" +
                "                        ],\n" +
                "                        \"$favoriteList\"\n" +
                "                     ]\n" +
                "                  },\n" +
                "                  \"else\":false\n" +
                "               }\n" +
                "            }\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"result.ownerId\":\"ownerId\"\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$match\":{\n" +
                "            \"result.deleted\":false\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$sort\":{\n" +
                "            \"parentId\":1\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$group\":{\n" +
                "            \"_id\":{\n" +
                "               \"title\":\"$title\",\n" +
                "               \"description\":\"$description\",\n" +
                "               \"caption\":\"$caption\",\n" +
                "               \"resourceId\":\"$resourceId\",\n" +
                "               \"resourceType\":\"$resourceType\",\n" +
                "               \"resourceUrl\":\"$resourceUrl\"\n" +
                "            },\n" +
                "            \"result\":{\n" +
                "               \"$first\":\"$result\"\n" +
                "            },\n" +
                "            \"modificationDate\":{\n" +
                "               \"$first\":\"$modificationDate\"\n" +
                "            },\n" +
                "            \"ownerName\":{\n" +
                "               \"$first\":\"$ownerName\"\n" +
                "            },\n" +
                "            \"favoriteList\":{\n" +
                "               \"$first\":\"$favoriteList\"\n" +
                "            },\n" +
                "            \"isLiked\":{\n" +
                "               \"$max\":\"$isLiked\"\n" +
                "            },\n" +
                "            \"boardId\":{\n" +
                "               \"$first\":\"$boardId\"\n" +
                "            },\n" +
                "            \"lastModifierId\":{\n" +
                "               \"$first\":\"$lastModifierId\"\n" +
                "            },\n" +
                "            \"lastModifierName\":{\n" +
                "               \"$first\":\"$lastModifierName\"\n" +
                "            },\n" +
                "            \"id\":{\n" +
                "               \"$first\":\"$_id\"\n" +
                "            },\n" +
                "            \"creationDate\":{\n" +
                "               \"$first\":\"$creationDate\"\n" +
                "            },\n" +
                "            \"ownerId\":{\n" +
                "               \"$first\":\"$ownerId\"\n" +
                "            },\n" +
                "            \"parentId\":{\n" +
                "               \"$first\":\"$parentId\"\n" +
                "            }\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$sort\":{\n" +
                "            \"result.modificationDate\":-1\n" +
                "         }\n" +
                "      },\n" +
                "      {\n" +
                "         \"$count\":\"count\"\n" +
                "      }\n" +
                "   ]\n" +
                "}");

        UserInfos testUser = new UserInfos();
        testUser.setUserId("ownerId");

        JsonObject query = Whitebox.invokeMethod(this.cardService, "getAllCardsQuery", testUser,
                "boardId", 0, false, false, false, "test", null, true);

        ctx.assertEquals(expected, query);

    }


}
