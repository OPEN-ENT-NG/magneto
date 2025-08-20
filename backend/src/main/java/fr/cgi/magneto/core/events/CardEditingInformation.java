package fr.cgi.magneto.core.events;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Information about a card being edited by a user.
 */
public class CardEditingInformation implements Model<CardEditingInformation> {

    private final String userId;
    private final String cardId;
    private final Long since;
    private final Boolean isMoving;

    public CardEditingInformation(String userId, String cardId, Long since, Boolean isMoving) {
        this.userId = userId;
        this.cardId = cardId;
        this.since = since;
        this.isMoving = isMoving;
    }

    public CardEditingInformation(JsonObject cardEditingInformationJson) {
        this.userId = cardEditingInformationJson.getString(Field.USERID, "");
        this.cardId = cardEditingInformationJson.getString(Field.CARDID, "");
        this.since = cardEditingInformationJson.getLong(Field.SINCE, 0L);
        this.isMoving = cardEditingInformationJson.getBoolean(Field.ISMOVING, false);
    }

    public String getUserId() {
        return userId;
    }

    public String getCardId() {
        return cardId;
    }

    public Long getSince() {
        return since;
    }

    public Boolean getIsMoving() {
        return isMoving;
    }

    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.USERID, this.getUserId())
                .put(Field.CARDID, this.getCardId())
                .put(Field.SINCE, this.getSince())
                .put(Field.ISMOVING, this.getIsMoving());
    }

    @Override
    public CardEditingInformation model(JsonObject cardEditingInformation) {
        return new CardEditingInformation(cardEditingInformation);
    }

    @Override
    public List<CardEditingInformation> toList(JsonArray results) {
        return Model.super.toList(results);
    }
}