package fr.cgi.magneto.model;

import fr.cgi.magneto.model.boards.BoardPayload;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class BoardPayloadTest {

    JsonObject boardCreateJsonObject_1 = new JsonObject()
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("backgroundUrl", "backgroundUrl")
            .put("canComment", false)
            .put("description", "description")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("creationDate", "creationDate")
            .put("modificationDate", "modificationDate")
            .put("deleted", false)
            .put("public", false)
            .put("isLocked", false)
            .put("cardIds", new JsonArray())
            .put("sectionIds", new JsonArray())
            .put("isExternal", false);

    JsonObject boardUpdateJsonObject_1 = new JsonObject()
            .put("_id", "id")
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("backgroundUrl", "backgroundUrl")
            .put("canComment", false)
            .put("isLocked", false)
            .put("description", "description")
            .put("modificationDate", "modificationDate")
            .put("public", false)
            .put("isExternal", false);;

    @Test
    public void testBoardPayloadHasBeenInstantiated(TestContext ctx) {
        BoardPayload board = new BoardPayload(boardCreateJsonObject_1);
        board.setModificationDate("modificationDate");
        board.setCreationDate("creationDate");
        ctx.assertEquals(boardCreateJsonObject_1, board.toJson());

        BoardPayload board2 = new BoardPayload(boardUpdateJsonObject_1);
        board2.setId("id").setModificationDate("modificationDate");
        ctx.assertEquals(boardUpdateJsonObject_1, board2.toJson());

    }

    @Test
    public void testBoardPayloadHasContentWithObject(TestContext ctx) {
        BoardPayload board = new BoardPayload(boardCreateJsonObject_1);
        boolean isNotEmpty =
                !board.getTitle().isEmpty() &&
                !board.getImageUrl().isEmpty() &&
                !board.getBackgroundUrl().isEmpty() &&
                !board.getDescription().isEmpty() &&
                !board.getOwnerId().isEmpty() &&
                !board.getOwnerName().isEmpty() &&
                !board.getCreationDate().isEmpty() &&
                !board.getModificationDate().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}
