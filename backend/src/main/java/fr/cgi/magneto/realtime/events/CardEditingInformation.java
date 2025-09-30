package fr.cgi.magneto.realtime.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;

/**
 * Information about a card being edited by a user.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CardEditingInformation implements Model<CardEditingInformation> {

    private String userId;
    private String cardId;
    private Long since;
    private Boolean isMoving;

    public CardEditingInformation() {
    }

    @JsonCreator
    public CardEditingInformation(
            @JsonProperty("userId") String userId,
            @JsonProperty("cardId") String cardId,
            @JsonProperty("since") Long since,
            @JsonProperty("isMoving") Boolean isMoving) {
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