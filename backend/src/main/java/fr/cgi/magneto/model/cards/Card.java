package fr.cgi.magneto.model.cards;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.Metadata;
import fr.cgi.magneto.model.Model;
import fr.cgi.magneto.model.comments.Comment;
import fr.cgi.magneto.model.user.User;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class Card implements Model<Card> {

    @JsonProperty("id")
    private String _id;
    @JsonProperty("title")
    private String title;
    @JsonProperty("resourceId")
    private String resourceId;
    @JsonProperty("resourceType")
    private String resourceType;
    @JsonProperty("resourceUrl")
    private String resourceUrl;
    @JsonProperty("description")
    private String description;
    @JsonIgnore
    private User owner;
    @JsonIgnore
    private User editor;
    @JsonProperty("creationDate")
    private String creationDate;
    @JsonProperty("modificationDate")
    private String modificationDate;
    @JsonProperty("caption")
    private String caption;
    @JsonProperty("parentId")
    private String parentId;
    @JsonProperty("boardId")
    private String boardId;
    @JsonProperty("boardTitle")
    private String boardTitle;
    @JsonProperty("locked")
    private boolean isLocked;
    @JsonProperty("metadata")
    private Metadata metadata;
    @JsonProperty("lastComment")
    @JsonIgnoreProperties(ignoreUnknown = true)
    private JsonObject lastComment;
    @JsonProperty("nbOfComments")
    private Integer nbOfComments;
    @JsonProperty("nbOfFavorites")
    private Integer nbOfFavorites;
    @JsonProperty("liked")
    private Boolean isLiked;
    @JsonProperty("comments")
    private List<Comment> comments;
    @JsonProperty("canBeIframed")
    private Boolean canBeIframed;
    @JsonProperty("favoriteList")
    private List<String> favoriteList;

    public Card() {
        this._id = null;
        this.nbOfComments = 0;
        this.nbOfFavorites = 0;
        this.isLiked = false;
        this.isLocked = false;
        this.lastComment = new JsonObject();
        this.favoriteList = new ArrayList<>();
        this.owner = new User(new JsonObject());
        this.editor = new User(new JsonObject());
        this.canBeIframed = false;
    }

    public Card(JsonObject card) {
        this._id = card.getString(Field._ID, null);
        this.title = card.getString(Field.TITLE);
        this.resourceId = card.getString(Field.RESOURCEID);
        this.resourceType = card.getString(Field.RESOURCETYPE);
        this.resourceUrl = card.getString(Field.RESOURCEURL);
        this.owner = new User(card.getString(Field.OWNERID), card.getString(Field.OWNERNAME));
        this.editor = new User(card.getString(Field.LASTMODIFIERID), card.getString(Field.LASTMODIFIERNAME));
        this.caption = card.getString(Field.CAPTION);
        this.description = card.getString(Field.DESCRIPTION);
        this.parentId = card.getString(Field.PARENTID);
        this.boardId = card.getString(Field.BOARDID);
        this.boardTitle = card.getString(Field.BOARDTITLE, null);
        this.creationDate = card.getString(Field.CREATIONDATE);
        this.modificationDate = card.getString(Field.MODIFICATIONDATE);
        this.isLocked = card.getBoolean(Field.ISLOCKED, false);
        this.metadata = null;
        this.lastComment = card.getJsonObject(Field.LASTCOMMENT, new JsonObject());
        this.nbOfComments = card.getInteger(Field.NBOFCOMMENTS, 0);
        JsonArray favoriteListOrNull = card.getJsonArray(Field.FAVORITE_LIST, new JsonArray());
        this.favoriteList = (favoriteListOrNull != null) ? favoriteListOrNull.getList() : new JsonArray().getList();
        this.nbOfFavorites = card.getInteger(Field.NBOFFAVORITES, 0);
        this.isLiked = card.getBoolean(Field.ISLIKED, false);
        this.comments = card.getJsonArray(Field.COMMENTS, new JsonArray()).stream()
                .map(obj -> new Comment((JsonObject) obj))
                .collect(Collectors.toList());
        this.canBeIframed = card.getBoolean(Field.CANBEIFRAMED, false);
        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
            this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }
    }

    public String getId() {
        return _id;
    }

    public Card setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Card setTitle(String title) {
        this.title = title;
        return this;
    }

    @JsonProperty("ownerId")
    public String getOwnerId() {
        return owner != null ? owner.getUserId() : null;
    }

    @JsonProperty("ownerId")
    public Card setOwnerId(String ownerId) {
        if (this.owner == null) {
            this.owner = new User();
        }
        this.owner.setUserId(ownerId);
        return this;
    }

    @JsonProperty("ownerName")
    public String getOwnerName() {
        return owner != null ? owner.getUsername() : null;
    }

    @JsonProperty("ownerName")
    public Card setOwnerName(String ownerName) {
        if (this.owner == null) {
            this.owner = new User();
        }
        this.owner.setUsername(ownerName);
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public Card setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public Boolean getCanBeIframed() {
        return canBeIframed;
    }

    public Card setCanBeIframed(Boolean canBeIframed) {
        this.canBeIframed = canBeIframed;
        return this;
    }

    public String getCaption() {
        return caption;
    }

    public Card setCaption(String caption) {
        this.caption = caption;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public Card setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public String getResourceType() {
        return resourceType;
    }

    public Card setResourceType(String resourceType) {
        this.resourceType = resourceType;
        return this;
    }

    @JsonProperty("lastModifierId")
    public String getLastModifierId() {
        return editor != null ? editor.getUserId() : null;
    }

    @JsonProperty("lastModifierId")
    public Card setLastModifierId(String lastModifierId) {
        if (this.editor == null) {
            this.editor = new User();
        }
        this.editor.setUserId(lastModifierId);
        return this;
    }

    @JsonProperty("lastModifierName")
    public String getLastModifierName() {
        return editor != null ? editor.getUsername() : null;
    }

    @JsonProperty("lastModifierName")
    public Card setLastModifierName(String lastModifierName) {
        if (this.editor == null) {
            this.editor = new User();
        }
        this.editor.setUsername(lastModifierName);
        return this;
    }

    public JsonObject getLastComment() {
        return lastComment;
    }

    public Card setLastComment(JsonObject lastComment) {
        this.lastComment = lastComment;
        return this;
    }

    public String getParentId() {
        return parentId;
    }

    public Card setParentId(String parentId) {
        this.parentId = parentId;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Card setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getResourceId() {
        return resourceId;
    }

    public Card setResourceId(String resourceId) {
        this.resourceId = resourceId;
        return this;
    }

    public String getBoardId() {
        return boardId;
    }

    public Card setBoardId(String boardId) {
        this.boardId = boardId;
        return this;
    }

    public Metadata getMetadata() {
        return metadata;
    }

    public Card setMetadata(Metadata metadata) {
        this.metadata = metadata;
        return this;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public Card setResourceUrl(String resourceUrl) {
        this.resourceUrl = resourceUrl;
        return this;
    }

    public String getBoardTitle() {
        return boardTitle;
    }

    public Card setBoardTitle(String boardTitle) {
        this.boardTitle = boardTitle;
        return this;
    }

    public boolean isLocked() {
        return isLocked;
    }

    public Card setLocked(boolean locked) {
        this.isLocked = locked;
        return this;
    }

    public int getNbOfComments() {
        return nbOfComments;
    }

    public Card setNbOfComments(int nbOfComments) {
        this.nbOfComments = nbOfComments;
        return this;
    }

    public void setNbOfFavorites(Integer nbOfFavorites) {
        this.nbOfFavorites = nbOfFavorites;
    }

    public Card setIsLiked(Boolean isLiked) {
        this.isLiked = isLiked;
        return this;
    }

    public Integer getNbOfFavorites() {
        return nbOfFavorites;
    }

    public Boolean isLiked() {
        return isLiked;
    }

    public List<String> getFavoriteList() { return favoriteList; }

    public Card setFavoriteList(List<String> favoriteList) {
    	this.favoriteList = favoriteList;
    	return this;
    }

    public List<Comment> getComments() { return comments; }

    public Card setComments(List<Comment> comments) {
        this.comments = comments;
        return this;
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
                .put(Field.LOCKED, this.isLocked())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.CREATIONDATE, this.getCreationDate())
                .put(Field.LASTCOMMENT, this.getLastComment())
                .put(Field.NBOFCOMMENTS, this.getNbOfComments())
                .put(Field.METADATA, this.getMetadata() != null ? this.getMetadata().toJson() : null)
                .put(Field.BOARDID, this.getBoardId())
                .put(Field.PARENTID, this.getParentId())
                .put(Field.NBOFFAVORITES, this.getNbOfFavorites())
                .put(Field.ISLIKED, this.isLiked())
                .put(Field.LIKED, this.isLiked())
                .put(Field.FAVORITE_LIST, this.getFavoriteList())
                .put(Field.CANBEIFRAMED, this.getCanBeIframed());

        if (this.comments != null){
            json.put(Field.COMMENTS, this.getComments().stream()
                    .map(Comment::toJson)
                    .collect(Collectors.toList()));
        }

        // Gestion des propriétés owner et editor qui peuvent être nulles
        if (this.owner != null) {
            json.put(Field.OWNERID, this.getOwnerId())
                    .put(Field.OWNERNAME, this.getOwnerName());
        }

        if (this.editor != null) {
            json.put(Field.LASTMODIFIERID, this.getLastModifierId())
                    .put(Field.LASTMODIFIERNAME, this.getLastModifierName());
        }

        return json;
    }

    @Override
    public Card model(JsonObject card) {
        return new Card(card);
    }

}

