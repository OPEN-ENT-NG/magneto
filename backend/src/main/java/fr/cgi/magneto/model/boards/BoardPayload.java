package fr.cgi.magneto.model.boards;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.enums.SortOrCreateByEnum;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.Collections;
import java.util.Date;
import java.util.List;

public class BoardPayload implements Model<BoardPayload> {
    private String _id;
    private String title;
    private String imageUrl;
    private String backgroundUrl;
    private String description;
    private String ownerId;
    private String ownerName;
    private String creationDate;
    private String modificationDate;
    private String folderId;
    private String layoutType;
    private Boolean canComment;
    private Boolean isLocked;
    private SortOrCreateByEnum sortOrCreateBy;

    private Boolean displayNbFavorites;
    private List<String> cardIds;
    private List<String> sectionIds;

    private List<String> tags;
    private boolean isPublic;

    private JsonArray shared;

    private Boolean isExternal;

    public BoardPayload() {

    }

    @SuppressWarnings("unchecked")
    public BoardPayload(JsonObject board) {
        this._id = board.getString(Field._ID, null);
        this.title = board.getString(Field.TITLE);
        this.imageUrl = board.getString(Field.IMAGEURL);
        this.backgroundUrl = board.getString(Field.BACKGROUNDURL);
        this.description = board.getString(Field.DESCRIPTION);
        this.ownerId = board.getString(Field.OWNERID);
        this.ownerName = board.getString(Field.OWNERNAME);
        this.folderId = board.getString(Field.FOLDERID);
        this.layoutType = board.getString(Field.LAYOUTTYPE);
        if (board.getBoolean(Field.ISLOCKED) != null) {
            this.isLocked = board.getBoolean(Field.ISLOCKED, false);
        }
        if (board.getBoolean(Field.CANCOMMENT) != null) {
            this.canComment = board.getBoolean(Field.CANCOMMENT, false);
        }
        if(board.getBoolean(Field.DISPLAY_NB_FAVORITES) != null) {
            this.displayNbFavorites = board.getBoolean(Field.DISPLAY_NB_FAVORITES, false);
        }
        this.cardIds = !board.getJsonArray(Field.CARDIDS, new JsonArray()).isEmpty() ?
                board.getJsonArray(Field.CARDIDS, new JsonArray()).getList() : null;
        this.sectionIds = !board.getJsonArray(Field.SECTIONIDS, new JsonArray()).isEmpty() ?
                board.getJsonArray(Field.SECTIONIDS, new JsonArray()).getList() : null;
        this.tags = !board.getJsonArray(Field.TAGS, new JsonArray()).isEmpty() ?
                board.getJsonArray(Field.TAGS, new JsonArray()).getList() : null;
        this.isPublic = board.getBoolean(Field.PUBLIC, false);
        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }
        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        if (board.getBoolean(Field.ISEXTERNAL) != null) {
            this.isExternal = board.getBoolean(Field.ISEXTERNAL, false);
        }
        if (board.containsKey(Field.SORTORCREATEBY)) {
            String value = board.getString(Field.SORTORCREATEBY);
            this.sortOrCreateBy = SortOrCreateByEnum.fromValue(value);
        }

    }

    public String getId() {
        return _id;
    }

    public BoardPayload setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public BoardPayload setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public BoardPayload setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

    public String getBackgroundUrl() {
        return backgroundUrl;
    }

    public BoardPayload setBackgroundUrl(String backgroundUrl) {
        this.backgroundUrl = backgroundUrl;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public BoardPayload setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public BoardPayload setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public BoardPayload setOwnerName(String ownerName) {
        this.ownerName = ownerName;
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public BoardPayload setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getFolderId() {
        return folderId;
    }

    public BoardPayload setFolderId(String folderId) {
        this.folderId = folderId;
        return this;
    }

    public String getLayoutType() {
        return layoutType;
    }

    public BoardPayload setLayoutType(String layoutType) {
        this.layoutType = layoutType;
        return this;
    }

    public Boolean canComment() {
        return canComment;
    }

    public BoardPayload setCanComment(Boolean canComment) {
        this.canComment = canComment;
        return this;
    }

    public Boolean isLocked() {
        return isLocked;
    }
    
    public BoardPayload setLocked(Boolean locked) {
        this.isLocked = locked;
        return this;
    }

    public Boolean getIsExternal() {
        return isExternal;
    }

    public BoardPayload setIsExternal(Boolean isExternal) {
        this.isExternal = isExternal;
        return this;
    }

    public SortOrCreateByEnum getSortOrCreateBy() {
        return sortOrCreateBy;
    }

    public BoardPayload setSortOrCreateBy(SortOrCreateByEnum sortOrCreateBy) {
        this.sortOrCreateBy = sortOrCreateBy;
        return this;
    }

    public Boolean displayNbFavorites() {
        return displayNbFavorites;
    }

    public BoardPayload setDisplayNbFavorites(Boolean displayNbFavorites) {
        this.displayNbFavorites = displayNbFavorites;
        return this;
    }

    public boolean isLayoutFree() {
        return this.layoutType.equals(Field.FREE);
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public BoardPayload setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public List<String> getCardIds() {
        return cardIds;
    }

    public BoardPayload setCardIds(List<String> cardIds) {
        this.cardIds = cardIds;
        return this;
    }

    public List<String> getSectionIds() {
        return sectionIds;
    }

    public BoardPayload setSectionIds(List<String> sectionIds) {
        this.sectionIds = sectionIds;
        return this;
    }

    public List<String> getTags() {
        return tags;
    }

    public BoardPayload setTags(List<String> tags) {
        this.tags = tags;
        return this;
    }

    public BoardPayload addCards(List<String> cardIds) {
        if (cardIds != null) {
            if (this.cardIds != null) {
                this.cardIds.addAll(0, cardIds);
            } else {
                this.cardIds = cardIds;
            }
        }
        return this;
    }

    public BoardPayload addSection(String sectionId) {
        if (sectionId != null) {
            if (this.sectionIds != null) {
                this.sectionIds.add(sectionId);
            } else {
                this.sectionIds = Collections.singletonList(sectionId);
            }
        }
        return this;
    }

    public BoardPayload addSections(List<String> sectionIds) {
        if (sectionIds != null) {
            if (this.sectionIds != null) {
                this.sectionIds.addAll(sectionIds);
            } else {
                this.sectionIds = sectionIds;
            }
        }
        return this;
    }

    public BoardPayload removeSectionIds(List<String> sectionIds) {
        if (sectionIds != null) {
            sectionIds.forEach((id) -> this.sectionIds.remove(id));
        }
        return this;
    }

    public BoardPayload removeCardIds(List<String> cardIds) {
        if (cardIds != null) {
            cardIds.forEach((id) -> this.cardIds.remove(id));
        }
        return this;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public BoardPayload setPublic(boolean isPublic) {
        this.isPublic = isPublic;
        return this;
    }

    public Boolean getIsLocked() {
        return isLocked;
    }

    public void setIsLocked(Boolean isLocked) {
        this.isLocked = isLocked;
    }

    public JsonArray getShared() {
        return shared;
    }

    public BoardPayload setShared(JsonArray shared) {
        this.shared = shared;
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
        if (this.getImageUrl() != null) {
            json.put(Field.IMAGEURL, this.getImageUrl());
        }
        if (this.getBackgroundUrl() != null) {
            json.put(Field.BACKGROUNDURL, this.getBackgroundUrl());
        }
        if (this.getDescription() != null) {
            json.put(Field.DESCRIPTION, this.getDescription());
        }

        if (this.getCardIds() != null && this.getId() != null) {
            json.put(Field.CARDIDS, new JsonArray(this.getCardIds()));
        }

        if (this.getSectionIds() != null && this.getId() != null) {
            json.put(Field.SECTIONIDS, new JsonArray(this.getSectionIds()));
        }

        if (this.getTags() != null) {
            json.put(Field.TAGS, new JsonArray(this.getTags()));
        }

        if (this.getLayoutType() != null) {
            json.put(Field.LAYOUTTYPE, this.getLayoutType());
        }

        if (this.canComment() != null) {
            json.put(Field.CANCOMMENT, this.canComment());
        }

        if (this.displayNbFavorites() != null) {
            json.put(Field.DISPLAY_NB_FAVORITES, this.displayNbFavorites());
        }

        if(this.shared != null && !this.shared.isEmpty()){
            json.put(Field.SHARED,shared);
        }
        
        if (this.isLocked() != null) {
            json.put(Field.ISLOCKED, this.isLocked());
        }

        json.put(Field.PUBLIC, this.isPublic());
        json.put(Field.MODIFICATIONDATE, this.getModificationDate());
        

        // If create
        if (this.getId() == null) {
            json.put(Field.CREATIONDATE, this.getCreationDate())
                    .put(Field.DELETED, false)
                    .put(Field.OWNERID, this.getOwnerId())
                    .put(Field.OWNERNAME, this.getOwnerName())
                    .put(Field.CARDIDS, new JsonArray())
                    .put(Field.SECTIONIDS, this.getSectionIds() != null ? this.getSectionIds() : new JsonArray());
        }

        if (this.getIsExternal() != null) {
            json.put(Field.ISEXTERNAL, this.getIsExternal());
        }
        if (this.getSortOrCreateBy() != null) {
            json.put(Field.ISEXTERNAL, this.getIsExternal());
        }

        return json;
    }

    @Override
    public BoardPayload model(JsonObject board) {
        return new BoardPayload(board);
    }

}
