package fr.cgi.magneto.model;

import fr.cgi.magneto.model.boards.*;
import io.vertx.core.json.*;
import io.vertx.ext.unit.*;
import io.vertx.ext.unit.junit.*;
import org.junit.*;
import org.junit.runner.*;

@RunWith(VertxUnitRunner.class)
public class BoardTest {

    JsonObject boardJsonObject = new JsonObject()
            .put("_id", "id")
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("backgroundUrl", "backgroundUrl")
            .put("canComment", false)
            .put("description", "description")
            .put("layoutType", "free")
            .put("modificationDate", "modificationDate")
            .put("cardIds", new JsonArray().add("cardId1").add("cardId2"))
            .put("sectionIds", new JsonArray())
            .putNull("creationDate")
            .put("deleted", false)
            .put("public", false)
            .put("folderId", "folderId")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("shared", new JsonArray())
            .put("tags", new JsonArray())
            .put("displayNbFavorites", false);

    @Test
    public void testBoardHasBeenInstantiated(TestContext ctx) {
        Board board = new Board(boardJsonObject);
        ctx.assertEquals(boardJsonObject, board.toJson());
    }

    @Test
    public void testBoardHasContentWithObject(TestContext ctx) {
        Board board = new Board(boardJsonObject);
        boolean isNotEmpty =
                !board.getId().isEmpty() &&
                !board.getTitle().isEmpty() &&
                !board.getImageUrl().isEmpty() &&
                !board.getBackgroundUrl().isEmpty() &&
                !board.getLayoutType().isEmpty() &&
                !board.getDescription().isEmpty() &&
                !board.getOwnerId().isEmpty() &&
                !board.getOwnerName().isEmpty() &&
                !board.getFolderId().isEmpty() &&
                !board.getModificationDate().isEmpty() &&
                !board.cards().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }
}
