package fr.cgi.magneto.model;

import fr.cgi.magneto.model.boards.Board;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

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
            .put("isLocked", false)
            .put("public", false)
            .put("folderId", "folderId")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("shared", new JsonArray())
            .put("tags", new JsonArray())
            .put("rights", new JsonArray())
            .put("displayNbFavorites", false)
            .put("nbCards", 0)
            .put("nbCardsSections", 0)
            .put("isExternal", false)
            .put("cards", new JsonArray())
            .put("sections", new JsonArray());;

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
