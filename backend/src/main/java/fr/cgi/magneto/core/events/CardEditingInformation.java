package fr.cgi.magneto.core.events;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonObject;

/**
 * Information about a card being edited by a user.
 */
public class CardEditingInformation {

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

    public String getNoteId() {
        return cardId;
    }

    public Long getSince() {
        return since;
    }

    public Boolean getIsMoving() {
        return isMoving;
    }
}