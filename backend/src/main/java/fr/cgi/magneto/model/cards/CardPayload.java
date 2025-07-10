package fr.cgi.magneto.model.cards;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class CardPayload implements Model<CardPayload> {

    private String id;
    private String title;
    private String resourceId;
    private String resourceType;
    private String resourceUrl;
    private String description;
    private String ownerId;
    private String ownerName;
    private String lastModifierId;
    private String lastModifierName;
    private String creationDate;
    private String modificationDate;
    private String caption;
    private boolean isLocked;
    private String parentId;
    private String boardId;
    private String sectionId;
    private List<String> favoriteList;

    public CardPayload() {
        this.id = null;
        this.title = "";
        this.resourceId = "";
        this.resourceType = "";
        this.resourceUrl = "";
        this.description = "";
        this.ownerId = "";
        this.ownerName = "";
        this.lastModifierId = "";
        this.lastModifierName = "";
        this.creationDate = DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT);
        this.modificationDate = DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT);
        this.caption = "";
        this.isLocked = false;
        this.parentId = "";
        this.boardId = "";
        this.sectionId = "";
        this.favoriteList = new ArrayList<>();
    }

    public CardPayload(JsonObject card) {
        this.id = card.getString(Field.ID, null);
        this.title = card.getString(Field.TITLE);
        this.resourceId = card.getString(Field.RESOURCEID);
        this.resourceType = card.getString(Field.RESOURCETYPE);
        this.resourceUrl = card.getString(Field.RESOURCEURL);
        this.ownerId = card.getString(Field.OWNERID);
        this.ownerName = card.getString(Field.OWNERNAME);
        this.lastModifierId = card.getString(Field.LASTMODIFIERID);
        this.lastModifierName = card.getString(Field.LASTMODIFIERNAME);
        this.caption = card.getString(Field.CAPTION);
        this.isLocked = card.getBoolean(Field.LOCKED, false);
        this.description = card.getString(Field.DESCRIPTION);
        this.parentId = card.getString(Field.PARENTID);
        this.boardId = card.getString(Field.BOARDID);
        this.sectionId = card.getString(Field.SECTIONID);
        this.favoriteList = card.getJsonArray(Field.FAVORITE_LIST, new JsonArray()).getList();

        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }
        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
    }

    public CardPayload(CardPayload other) {
        this.id = other.id;
        this.title = other.title;
        this.resourceId = other.resourceId;
        this.resourceType = other.resourceType;
        this.resourceUrl = other.resourceUrl;
        this.description = other.description;
        this.ownerId = other.ownerId;
        this.ownerName = other.ownerName;
        this.lastModifierId = other.lastModifierId;
        this.lastModifierName = other.lastModifierName;
        this.creationDate = other.creationDate;
        this.modificationDate = other.modificationDate;
        this.caption = other.caption;
        this.isLocked = other.isLocked;
        this.parentId = other.parentId;
        this.boardId = other.boardId;
        this.sectionId = other.sectionId;
        // Create a new list to avoid sharing the reference
        this.favoriteList = other.favoriteList != null ?
                new ArrayList<>(other.favoriteList) : new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public CardPayload setId(String id) {
        this.id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public CardPayload setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public CardPayload setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public CardPayload setOwnerName(String ownerName) {
        this.ownerName = ownerName;
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public CardPayload setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getCaption() {
        return caption;
    }

    public CardPayload setCaption(String caption) {
        this.caption = caption;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public CardPayload setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public String getResourceType() {
        return resourceType;
    }

    public CardPayload setResourceType(String resourceType) {
        this.resourceType = resourceType;
        return this;
    }

    public String getLastModifierId() {
        return lastModifierId;
    }

    public CardPayload setLastModifierId(String lastModifierId) {
        this.lastModifierId = lastModifierId;
        return this;
    }

    public String getLastModifierName() {
        return lastModifierName;
    }

    public CardPayload setLastModifierName(String lastModifierName) {
        this.lastModifierName = lastModifierName;
        return this;
    }

    public String getParentId() {
        return parentId;
    }

    public CardPayload setParentId(String parentId) {
        this.parentId = parentId;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CardPayload setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getResourceId() {
        return resourceId;
    }

    public CardPayload setResourceId(String resourceId) {
        this.resourceId = resourceId;
        return this;
    }

    public String getBoardId() {
        return boardId;
    }

    public CardPayload setBoardId(String boardId) {
        this.boardId = boardId;
        return this;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public CardPayload setResourceVideoUrl(String resourceUrl) {
        this.resourceUrl = resourceUrl;
        return this;
    }

    public String getSectionId() {
        return sectionId;
    }

    public CardPayload setSectionId(String sectionId) {
        this.sectionId = sectionId;
        return this;
    }

    public boolean isLocked() {
        return isLocked;
    }

    public CardPayload setLocked(boolean locked) {
        this.isLocked = locked;
        return this;
    }

    public CardPayload setFavoriteList(List<String> favoriteList) {
        this.favoriteList = favoriteList;
        return this;
    }

    public List<String> getFavoriteList() {
        return favoriteList;
    }

    @Override
    public JsonObject toJson() {

        JsonObject json = new JsonObject()
                .put(Field.ID, this.getId())
                .put(Field.TITLE, this.getTitle())
                .put(Field.RESOURCETYPE, this.getResourceType())
                .put(Field.RESOURCEID, this.getResourceId())
                .put(Field.RESOURCEURL, this.getResourceUrl())
                .put(Field.DESCRIPTION, this.getDescription())
                .put(Field.CAPTION, this.getCaption())
                .put(Field.ISLOCKED, this.isLocked())
                .put(Field.BOARDID, this.getBoardId())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.LASTMODIFIERID, this.getLastModifierId())
                .put(Field.LASTMODIFIERNAME, this.getLastModifierName())
                .put(Field.FAVORITE_LIST, this.getFavoriteList());

        // If create
        if (this.getId() == null) {
            json.put(Field.CREATIONDATE, this.getCreationDate())
                    .put(Field.OWNERID, this.getOwnerId())
                    .put(Field.OWNERNAME, this.getOwnerName())
                    .put(Field.BOARDID, this.getBoardId())
                    .put(Field.PARENTID, this.getParentId());
        }

        return json;
    }

    @Override
    public CardPayload model(JsonObject card) {
        return new CardPayload(card);
    }

}

