package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

public class Section implements Model {
    private String _id;
    private String title;
    private List<String> cardIds;
    private String boardId;

    @SuppressWarnings("unchecked")
    public Section(JsonObject section) {
        this._id = section.getString(Field._ID, null);
        this.title = section.getString(Field.TITLE);
        this.cardIds = section.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
        this.boardId = section.getString(Field.BOARDID);
    }
    public Section() {

    }

    public String getId() {
        return _id;
    }

    public String getTitle() {
        return title;
    }

    public List<String> getCardIds() {
        return cardIds;
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

    public Section addCardIds(List<String> cardIds) {
        this.cardIds.addAll(0, cardIds);
        return this;
    }

    public Section setId(String id) {
        this._id = id;
        return this;
    }

    public Section setTitle(String title) {
        this.title = title;
        return this;
    }

    public Section setBoardId(String boardId) {
        this.boardId = boardId;
        return this;
    }

    public Section setCardIds(List<String> cardIds) {
        this.cardIds = cardIds;
        return this;
    }


    @Override
    public JsonObject toJson() {
        JsonObject json = new JsonObject()
                .put(Field._ID, this.getId())
                .put(Field.TITLE, this.getTitle())
                .put(Field.CARDIDS, this.getCardIds())
                .put(Field.BOARDID, this.getBoardId());
        return json;
    }

    @Override
    public Section model(JsonObject section) {
        return new Section(section);
    }


}
