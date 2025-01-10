package fr.cgi.magneto.model.boards;

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
    private String _id;
    private String title;
    private String imageUrl;
    private String backgroundUrl;
    private String description;
    private User owner;
    private JsonArray shared;
    private String creationDate;
    private String modificationDate;
    private boolean isDeleted;
    private boolean isPublic;
    private String folderId;
    private List<Card> cards;
    private List<Section> sections;
    private List<String> tags;
    private String layoutType;
    private boolean canComment;
    private Boolean displayNbFavorites;
    private int nbCards;
    private int nbCardsSections;
    private JsonArray rights;


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
        if (board.containsKey(Field.NBCARDSSECTIONS))
            this.nbCardsSections = board.getInteger(Field.NBCARDSSECTIONS);
        this.rights = board.getJsonArray(Field.RIGHTS, new JsonArray());

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

    public String getOwnerId() {
        return this.owner.getUserId();
    }

    public Board setOwnerId(String ownerId) {
        this.owner.setUserId(ownerId);
        return this;
    }

    public String getOwnerName() {
        return this.owner.getUsername();
    }

    public Board setUserName(String ownerName) {
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

    public List<String> cardIds() {
       return this.cards().stream().map(Card::getId).collect(Collectors.toList());
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

    public boolean isLayoutFree() {
        return this.layoutType.equals(Field.FREE);
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

    public Board reset() {
        this.setId(null);
        this.setPublic(false);
        this.setShared(new JsonArray());
        return this;
    }

    @Override
    public JsonObject toJson() {
        JsonArray cardsArray = new JsonArray(this.cardIds());
        JsonArray sectionArray = new JsonArray(this.sectionIds());
        return new JsonObject()
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
                .put(Field.NBCARDSSECTIONS, this.getNbCardsSections());
    }

    @Override
    public Board model(JsonObject board) {
        return new Board(board);
    }

}
