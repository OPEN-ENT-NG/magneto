package fr.cgi.magneto.model;

import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.comments.Comment;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.ArrayList;

@RunWith(VertxUnitRunner.class)
public class CardTest {

    JsonObject cardJsonObject = new JsonObject()
            .put("_id", "id")
            .put("title", "title")
            .put("resourceId", "resourceId")
            .put("resourceType", "resourceType")
            .put("resourceUrl", "resourceUrl")
            .put("description", "description")
            .put("lastModifierName", "lastModifierName")
            .put("lastModifierId", "lastModifierId")
            .put("creationDate", "creationDate")
            .put("modificationDate", "modificationDate")
            .put("nbOfComments", 0)
            .put("creationDate", "creationDate")
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("boardId", "boardId")
            .put("isLocked", false)
            .put("lastComment", new JsonObject())
            .putNull("metadata")
            .putNull("parentId")
            .put("caption", "caption")
            .put("nbOfFavorites",0)
            .put("isLiked",false)
            .put("favoriteList", new JsonArray().getList())
            .put("comments", new ArrayList<Comment>());

    @Test
    public void testCardHasBeenInstantiated(TestContext ctx) {
        Card card = new Card(cardJsonObject);
        ctx.assertEquals(cardJsonObject, card.toJson());
    }

    @Test
    public void testCardHasContentWithObject(TestContext ctx) {
        Card card = new Card(cardJsonObject);
        boolean isNotEmpty =
                !card.getTitle().isEmpty() &&
                !card.getResourceId().isEmpty() &&
                !card.getResourceType().isEmpty() &&
                !card.getResourceUrl().isEmpty() &&
                !card.getDescription().isEmpty() &&
                !card.getLastModifierName().isEmpty() &&
                !card.getLastModifierId().isEmpty() &&
                !card.getModificationDate().isEmpty() &&
                !card.getCaption().isEmpty();
        ctx.assertTrue(isNotEmpty);
    }


}
