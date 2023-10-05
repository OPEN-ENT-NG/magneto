package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class SectionPayload implements Model {
    private String _id;
    private String title;
    private List<String> cardIds;
    private String boardId;
    private boolean hided;

    @SuppressWarnings("unchecked")
    public SectionPayload(JsonObject section) {
        this._id = section.getString(Field._ID, null);
        this.title = section.getString(Field.TITLE);
        this.cardIds = section.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
        this.boardId = section.getString(Field.BOARDID);
        this.hided = section.getBoolean(Field.HIDED);
    }

    public SectionPayload(String boardId) {
        this._id = null;
        this.cardIds = new ArrayList<>();
        this.boardId = boardId;
    }

    public SectionPayload() {

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

    public SectionPayload removeCardIds(List<String> cardIds) {
        this.cardIds = this.cardIds.stream()
                .filter(s -> !cardIds.contains(s))
                .collect(Collectors.toList());
        return this;
    }


    public String getBoardId() {
        return boardId;
    }

    public SectionPayload addCardIds(List<String> cardIds) {
        if (cardIds != null) {
            if (this.cardIds != null) {
                this.cardIds.addAll(0, cardIds);
            } else {
                this.cardIds = cardIds;
            }
        }
        return this;
    }

    public SectionPayload setId(String id) {
        this._id = id;
        return this;
    }

    public SectionPayload setTitle(String title) {
        this.title = title;
        return this;
    }

    public SectionPayload setBoardId(String boardId) {
        this.boardId = boardId;
        return this;
    }

    public SectionPayload setCardIds(List<String> cardIds) {
        this.cardIds = cardIds;
        return this;
    }


    @Override
    public JsonObject toJson() {
        JsonObject json = new JsonObject();
        if (this.getId() != null) {
            json.put(Field._ID, this.getId());
        }
        if (this.getTitle() != null) {
            json.put(Field.TITLE, this.getTitle());
        }
        if (this.getCardIds() != null) {
            json.put(Field.CARDIDS, this.getCardIds());
        }
        if (this.getBoardId() != null) {
            json.put(Field.BOARDID, this.getBoardId());
        }

        // If create
        if (this.getId() == null && this.getCardIds() == null) {
            json.put(Field.CARDIDS, new JsonArray());
        }
        return json;
    }

    @Override
    public SectionPayload model(JsonObject section) {
        return new SectionPayload(section);
    }


}
