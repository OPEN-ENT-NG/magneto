package fr.cgi.magneto.model;

import fr.cgi.magneto.model.cards.Card;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(VertxUnitRunner.class)
public class CardTest {

    JsonObject cardJsonObject = new JsonObject()
            .put("id", "id")
            .put("title", "title")
            .put("resourceType", "resourceType")
            .put("resourceId", "resourceId")
            .put("resourceUrl", "resourceUrl")
            .put("description", "description")
            .put("caption", "caption")
            .put("isLocked", false)
            .put("locked", false)
            .put("modificationDate", "modificationDate")
            .put("creationDate", "creationDate")
            .put("lastComment", new JsonObject())
            .put("nbOfComments", 0)
            .put("metadata", null)
            .put("boardId", "boardId")
            .put("parentId", null)
            .put("nbOfFavorites", 0)
            .put("isLiked", false)
            .put("liked", false)
            .put("favoriteList", new JsonArray())
            .put("canBeIframed", false)
            .put("comments", new JsonArray())
            .put("ownerId", "ownerId")
            .put("ownerName", "ownerName")
            .put("lastModifierId", "lastModifierId")
            .put("lastModifierName", "lastModifierName");

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
