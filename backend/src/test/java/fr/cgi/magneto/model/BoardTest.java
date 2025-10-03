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

    JsonArray cardsArray = new JsonArray()
            .add(new JsonObject()
                    .put("id", "cardId1")
                    .put("title", null)
                    .put("resourceType", null)
                    .put("resourceId", null)
                    .put("resourceUrl", null)
                    .put("description", null)
                    .put("caption", null)
                    .put("isLocked", false)
                    .put("locked", false)
                    .put("modificationDate", null)
                    .put("creationDate", null)
                    .put("lastComment", new JsonObject())
                    .put("nbOfComments", 0)
                    .put("metadata", null)
                    .put("boardId", null)
                    .put("parentId", null)
                    .put("nbOfFavorites", 0)
                    .put("isLiked", false)
                    .put("liked", false)
                    .put("favoriteList", new JsonArray())
                    .put("canBeIframed", false)
                    .put("comments", new JsonArray())
                    .put("ownerId", null)
                    .put("ownerName", null)
                    .put("lastModifierId", null)
                    .put("lastModifierName", null))
            .add(new JsonObject()
                    .put("id", "cardId2")
                    .put("title", null)
                    .put("resourceType", null)
                    .put("resourceId", null)
                    .put("resourceUrl", null)
                    .put("description", null)
                    .put("caption", null)
                    .put("isLocked", false)
                    .put("locked", false)
                    .put("modificationDate", null)
                    .put("creationDate", null)
                    .put("lastComment", new JsonObject())
                    .put("nbOfComments", 0)
                    .put("metadata", null)
                    .put("boardId", null)
                    .put("parentId", null)
                    .put("nbOfFavorites", 0)
                    .put("isLiked", false)
                    .put("liked", false)
                    .put("favoriteList", new JsonArray())
                    .put("canBeIframed", false)
                    .put("comments", new JsonArray())
                    .put("ownerId", null)
                    .put("ownerName", null)
                    .put("lastModifierId", null)
                    .put("lastModifierName", null));

    JsonObject boardJsonObject = new JsonObject()
            .put("_id", "id")
            .put("title", "title")
            .put("imageUrl", "imageUrl")
            .put("backgroundUrl", "backgroundUrl")
            .put("description", "description")
            .put("modificationDate", "modificationDate")
            .put("cardIds", new JsonArray().add("cardId1").add("cardId2"))
            .put("sectionIds", new JsonArray())
            .putNull("creationDate")
            .put("deleted", false)
            .put("public", false)
            .put("isLocked", false)
            .put("folderId", "folderId")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("shared", new JsonArray())
            .put("layoutType", "free")
            .put("canComment", false)
            .put("displayNbFavorites", false)
            .put("tags", new JsonArray())
            .put("rights", new JsonArray())
            .put("nbCards", 0)
            .put("nbCardsSections", 0)
            .put("isExternal", false)
            .put("cards", cardsArray)
            .put("sections", new JsonArray());

    @Test
    public void testBoardHasBeenInstantiated(TestContext ctx) {
        Board board = new Board(boardJsonObject);
        ctx.assertEquals(boardJsonObject.encode(), board.toJson().encode());
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
