package fr.cgi.magneto.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.cards.Card;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

public class Section implements Model {
    @JsonProperty("_id")
    private String _id;

    @JsonProperty("title")
    private String title;

    @JsonProperty("cardIds")
    private List<String> cardIds;

    @JsonProperty("boardId")
    private String boardId;

    @JsonProperty("displayed")
    private Boolean displayed;

    @JsonProperty("cards")
    private List<Card> cards;

    @SuppressWarnings("unchecked")
    public Section(JsonObject section) {
        this._id = section.getString(Field._ID, null);
        this.title = section.getString(Field.TITLE);
        this.cardIds = section.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
        this.boardId = section.getString(Field.BOARDID);
        if (section.containsKey(Field.DISPLAYED))
            this.displayed = section.getBoolean(Field.DISPLAYED);
        if (section.containsKey(Field.CARDS))
            this.cards = section.getJsonArray(Field.CARDS).getList();
    }

    public Section() {

    }

    public String getId() {
        return _id;
    }

    public Section setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Section setTitle(String title) {
        this.title = title;
        return this;
    }

    public List<String> getCardIds() {
        return cardIds;
    }

    public Section setCardIds(List<String> cardIds) {
        this.cardIds = cardIds;
        return this;
    }

    public Section removeCardIds(List<String> cardIds) {
        this.cardIds = this.cardIds.stream()
                .filter(s -> !cardIds.contains(s))
                .collect(Collectors.toList());
        return this;
    }

    public String getBoardId() {
        return boardId;
    }

    public Section setBoardId(String boardId) {
        this.boardId = boardId;
        return this;
    }

    public Section addCardIds(List<String> cardIds) {
        this.cardIds.addAll(0, cardIds);
        return this;
    }

    public boolean getDisplayed() {
        if (this.displayed != null)
            return displayed;
        else
            return true;
    }

    public void setDisplayed(boolean displayed) {
        this.displayed = displayed;
    }

    public List<Card> getCards() {
        return cards;
    }

    public Section setCards(List<Card> cards) {
        this.cards = cards;
        return this;
    }

    @Override
    public JsonObject toJson() {
        JsonObject json = new JsonObject()
                .put(Field._ID, this.getId())
                .put(Field.TITLE, this.getTitle())
                .put(Field.CARDIDS, this.getCardIds())
                .put(Field.BOARDID, this.getBoardId());
        if (this.displayed != null)
            json.put(Field.DISPLAYED, this.getDisplayed());
        if (this.cards != null) {
            JsonArray cardsJsonArray = new JsonArray();
            this.cards.forEach(card -> cardsJsonArray.add(card.toJson()));
            json.put(Field.CARDS, cardsJsonArray);
        }
        return json;
    }

    @Override
    public Section model(JsonObject section) {
        return new Section(section);
    }


}
