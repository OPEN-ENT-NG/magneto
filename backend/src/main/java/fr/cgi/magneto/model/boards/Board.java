package fr.cgi.magneto.model.boards;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.model.Model;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.user.User;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class Board implements Model<Board> {
    @JsonProperty("_id")
    private String _id;
    @JsonProperty("title")
    private String title;
    @JsonProperty("imageUrl")
    private String imageUrl;
    @JsonProperty("backgroundUrl")
    private String backgroundUrl;
    @JsonProperty("description")
    private String description;
    @JsonIgnore
    private User owner;
    @JsonIgnore
    private JsonArray shared;
    @JsonProperty("creationDate")
    private String creationDate;
    @JsonProperty("modificationDate")
    private String modificationDate;
    @JsonProperty("deleted")
    private boolean isDeleted;
    @JsonProperty("public")
    private boolean isPublic;
    @JsonProperty("locked")
    private boolean isLocked;
    @JsonProperty("folderId")
    private String folderId;
    @JsonProperty("cards")
    private List<Card> cards;
    @JsonProperty("sections")
    private List<Section> sections;
    @JsonProperty("tags")
    private List<String> tags;
    @JsonProperty("layoutType")
    private String layoutType;
    @JsonProperty("canComment")
    private boolean canComment;
    @JsonProperty("displayNbFavorites")
    private Boolean displayNbFavorites;
    @JsonProperty("nbCards")
    private int nbCards;
    @JsonProperty("nbCardsSections")
    private int nbCardsSections;
    @JsonIgnore
    private JsonArray rights;
    @JsonProperty("isExternal")
    private boolean isExternal;
    @JsonProperty("sectionIds")
    private List<String> sectionsIds;
    @JsonProperty("cardIds")
    private List<String> cardIds;

    public Board() {
        this.owner = new User();
        this.shared = new JsonArray();
        this.rights = new JsonArray();
        this.cards = new ArrayList<>();
        this.sections = new ArrayList<>();
        this.tags = new ArrayList<>();
    }

    // Méthodes Jackson pour shared
    @JsonProperty("shared")
    private void setSharedFromJson(List<Object> sharedList) {
        this.shared = sharedList != null ? new JsonArray(sharedList) : new JsonArray();
    }

    @JsonProperty("shared")
    private List<Object> getSharedForJson() {
        return this.shared != null ? this.shared.getList() : new ArrayList<>();
    }

    // Méthodes Jackson pour rights
    @JsonProperty("rights")
    private void setRightsFromJson(List<Object> rightsList) {
        this.rights = rightsList != null ? new JsonArray(rightsList) : new JsonArray();
    }

    @JsonProperty("rights")
    private List<Object> getRightsForJson() {
        return this.rights != null ? this.rights.getList() : new ArrayList<>();
    }

    @SuppressWarnings("unchecked")
    public Board(JsonObject board) {
        this._id = board.getString(Field._ID, null);
        this.title = board.getString(Field.TITLE);
        this.imageUrl = board.getString(Field.IMAGEURL);
        this.backgroundUrl = board.getString(Field.BACKGROUNDURL);
        this.description = board.getString(Field.DESCRIPTION);
        this.owner = new User(board.getString(Field.OWNERID), board.getString(Field.OWNERNAME));
        this.shared = board.getJsonArray(Field.SHARED, new JsonArray());
        this.isPublic = board.getBoolean(Field.PUBLIC, false);
        this.isLocked = board.getBoolean(Field.ISLOCKED, false);
        this.folderId = board.getString(Field.FOLDERID);
        this.modificationDate = board.getString(Field.MODIFICATIONDATE);
        this.layoutType = board.getString(Field.LAYOUTTYPE);
        this.canComment = board.getBoolean(Field.CANCOMMENT, false);
        this.displayNbFavorites = board.getBoolean(Field.DISPLAY_NB_FAVORITES, false);
        JsonArray sectionsArray = new JsonArray(((List<String>) board.getJsonArray(Field.SECTIONIDS, new JsonArray()).getList())
                        .stream()
                        .map(id -> new JsonObject().put(Field._ID, id))
                        .collect(Collectors.toList()));
        this.sections = ModelHelper.toList(sectionsArray, Section.class);
        JsonArray cardsArray = new JsonArray(((List<String>) board.getJsonArray(Field.CARDIDS, new JsonArray()).getList())
                        .stream()
                        .map(id -> new JsonObject().put(Field._ID, id))
                        .collect(Collectors.toList()));
        this.cards = ModelHelper.toList(cardsArray, Card.class);
        this.tags = board.getJsonArray(Field.TAGS, new JsonArray()).getList();
        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
            this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }
        if (board.containsKey(Field.NBCARDS))
            this.nbCards = board.getInteger(Field.NBCARDS);
        if (board.containsKey(Field.NBCARDSSECTIONS))
            this.nbCardsSections = board.getInteger(Field.NBCARDSSECTIONS);
        this.rights = board.getJsonArray(Field.RIGHTS, new JsonArray());
        this.isExternal = board.getBoolean(Field.ISEXTERNAL, false);
        if (board.containsKey(Field.SECTIONIDS))
            this.sectionsIds = board.getJsonArray(Field.SECTIONIDS, new JsonArray()).getList();
        if (board.containsKey(Field.CARDIDS))
            this.cardIds = board.getJsonArray(Field.CARDIDS, new JsonArray()).getList();
    }

    public String getId() {
        return _id;
    }

    public Board setId(String id) {
        this._id = id;
        return this;
    }

    public String getTitle() {
        return title;
    }

    public Board setTitle(String title) {
        this.title = title;
        return this;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Board setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

    public String getBackgroundUrl() {
        return backgroundUrl;
    }

    public Board setBackgroundUrl(String backgroundUrl) {
        this.backgroundUrl = backgroundUrl;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public Board setDescription(String description) {
        this.description = description;
        return this;
    }

    @JsonProperty("ownerId")
    public String getOwnerId() {
        return this.owner != null ? this.owner.getUserId() : null;
    }

    @JsonProperty("ownerId")
    public Board setOwnerId(String ownerId) {
        if (this.owner == null) {
            this.owner = new User();
        }
        this.owner.setUserId(ownerId);
        return this;
    }

    @JsonProperty("ownerName")
    public String getOwnerName() {
        return this.owner != null ? this.owner.getUsername() : null;
    }

    @JsonProperty("ownerName")
    public Board setUserName(String ownerName) {
        if (this.owner == null) {
            this.owner = new User();
        }
        this.owner.setUsername(ownerName);
        return this;
    }

    public JsonArray getShared() {
        return shared;
    }
    public Board setShared(JsonArray shared) {
        this.shared = shared;
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public Board setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getFolderId() {
        return folderId;
    }

    public Board setFolderId(String folderId) {
        this.folderId = folderId;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public Board setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public boolean isDeleted() {
        return isDeleted;
    }

    public Board setDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
        return this;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public Board setPublic(boolean isPublic) {
        this.isPublic = isPublic;
        return this;
    }

    public List<Card> cards() {
        return this.layoutType != null ? this.layoutType.equals(Field.FREE) ? this.cards : this.getCardsSection() : new ArrayList<>();
    }

    public Board setCards(List<Card> cards) {
        this.cards = cards;
        return this;
    }

    public List<Section> sections() {
        return this.sections;
    }

    public List<String> getCardsBySection(List<String> sectionIds) {
        List<String> cardIds = new ArrayList<>();
        this.sections.forEach((section) -> {
            if (sectionIds.contains(section.getId())) {
                cardIds.addAll(section.getCardIds());
            }
        });
        return cardIds;
    }

    public List<Card> getCardsSection() {
        List<Card> cards = new ArrayList<>();
        this.sections.forEach((section) -> {
            JsonArray cardsArray = new JsonArray(section.getCardIds()
                    .stream()
                    .map(id -> new JsonObject().put(Field._ID, id))
                    .collect(Collectors.toList()));
            cards.addAll(ModelHelper.toList(cardsArray, Card.class));
        });
        return cards;
    }

    public Board setSections(List<Section> sections) {
        this.sections = sections;
        return this;
    }

    public List<String> sectionIds() {
        return this.sections().stream().map(Section::getId).collect(Collectors.toList());
    }

    public String getLayoutType() {
        return this.layoutType;
    }

    public Board setLayoutType(String layoutType) {
        this.layoutType = layoutType;
        return this;
    }

    @JsonProperty("layoutFree")
    public boolean isLayoutFree() {
        return this.layoutType != null && this.layoutType.equals(Field.FREE);
    }

    @JsonProperty("layoutFree")
    public void setLayoutFree(boolean layoutFree) {
        this.layoutType = layoutFree ? Field.FREE : "sections";
    }

    public boolean isLocked() {
        return isLocked;
    }

    public Board setLocked(boolean isLocked) {
        this.isLocked = isLocked;
        return this;
    }

    public boolean canComment() {
        return this.canComment;
    }

    public Board setCanComment(boolean canComment) {
        this.canComment = canComment;
        return this;
    }

    public boolean displayNbFavorites() {
        return this.displayNbFavorites;
    }

    public Board setDisplayNbFavorites(boolean displayNbFavorites) {
        this.displayNbFavorites = displayNbFavorites;
        return this;
    }

    public List<String> tags() {
        return this.tags;
    }

    public Board setTags(List<String> tags) {
        this.tags = tags;
        return this;
    }

    public int getNbCards() {
        return nbCards;
    }

    public void setNbCards(int nbCards) {
        this.nbCards = nbCards;
    }

    public int getNbCardsSections() {
        return nbCardsSections;
    }

    public void setNbCardsSections(int nbCardsSections) {
        this.nbCardsSections = nbCardsSections;
    }

    public void setRights(JsonArray rights) {
        this.rights = rights;
    }

    public JsonArray getRights() {
        return this.rights;
    }

    public boolean getIsExternal() { return isExternal; }

    public void setIsExternal(boolean isExternal) { this.isExternal = isExternal; }

    public List<String> getSectionIds() { return sectionsIds; }

    public void setSectionIds(List<String> sectionIds) { this.sectionsIds = sectionIds; }

    public List<String> getCardIds() { return cardIds; }

    public void setCardIds(List<String> cardIds) { this.cardIds = cardIds; }

    public Board reset() {
        this.setId(null);
        this.setPublic(false);
        this.setShared(new JsonArray());
        return this;
    }

    @Override
    public JsonObject toJson() {
        JsonArray cardsArray = new JsonArray(this.getCardIds() != null ? this.getCardIds() : new ArrayList<>());
        JsonArray sectionArray = new JsonArray(this.sectionIds());
        JsonObject board = new JsonObject()
                .put(Field._ID, this.getId())
                .put(Field.TITLE, this.getTitle())
                .put(Field.IMAGEURL, this.getImageUrl())
                .put(Field.BACKGROUNDURL, this.getBackgroundUrl())
                .put(Field.DESCRIPTION, this.getDescription())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.CARDIDS, cardsArray)
                .put(Field.SECTIONIDS, sectionArray)
                .put(Field.CREATIONDATE, this.getCreationDate())
                .put(Field.DELETED, this.isDeleted())
                .put(Field.PUBLIC, this.isPublic())
                .put(Field.ISLOCKED, this.isLocked())
                .put(Field.FOLDERID, this.getFolderId())
                .put(Field.OWNERID, this.getOwnerId())
                .put(Field.OWNERNAME, this.getOwnerName())
                .put(Field.SHARED, this.shared)
                .put(Field.LAYOUTTYPE, this.getLayoutType())
                .put(Field.CANCOMMENT, this.canComment())
                .put(Field.DISPLAY_NB_FAVORITES, this.displayNbFavorites())
                .put(Field.TAGS, this.tags())
                .put(Field.RIGHTS, this.getRights())
                .put(Field.NBCARDS, this.getNbCards())
                .put(Field.NBCARDSSECTIONS, this.getNbCardsSections())
                .put(Field.ISEXTERNAL, this.getIsExternal());
        if (this.cards != null) {
            JsonArray cardsJsonArray = new JsonArray();
            this.cards().forEach(card -> cardsJsonArray.add(card.toJson()));
            board.put(Field.CARDS, cardsJsonArray);
        }
        // Convertir explicitement les sections en utilisant leur toJson()
        if (this.sections != null) {
            JsonArray sectionsJsonArray = new JsonArray();
            this.sections().forEach(section -> sectionsJsonArray.add(section.toJson()));
            board.put(Field.SECTIONS, sectionsJsonArray);
        }
        return board;
    }

    @Override
    public Board model(JsonObject board) {
        return new Board(board);
    }

}
