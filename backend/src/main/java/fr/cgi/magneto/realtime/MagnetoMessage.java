package fr.cgi.magneto.realtime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.user.User;
import fr.cgi.magneto.realtime.events.CardEditingInformation;
import fr.cgi.magneto.realtime.events.MagnetoUserAction;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

public class MagnetoMessage {
    @JsonProperty("boardId")
    private final String boardId;
    @JsonProperty("emittedAt")
    private final long emittedAt;
    @JsonProperty("emittedBy")
    private final String emittedBy;
    @JsonProperty("websocketId")
    private final String websocketId;
    @JsonProperty("type")
    private final MagnetoMessageType type;
    @JsonProperty("userId")
    private final String userId;
    @JsonProperty("cardId")
    private final String cardId;
    @JsonProperty("board")
    private final Board board;
    @JsonProperty("card")
    private final Card card;
    @JsonProperty("oldCard")
    private final Card oldCard;
    @JsonProperty("cards")
    private final List<Card> cards;
    @JsonProperty("section")
    private final Section section;
    @JsonProperty("sections")
    private final List<Section> sections;
    @JsonProperty("connectedUsers")
    private final LinkedHashSet<User> connectedUsers;
    @JsonProperty("cardEditingInformations")
    private final List<CardEditingInformation> cardEditingInformations;
    @JsonProperty("actionType")
    private final MagnetoUserAction.ActionType actionType;
    @JsonProperty("actionId")
    private final String actionId;
    @JsonProperty("maxConnectedUsers")
    private final Long maxConnectedUsers;

    @JsonIgnore
    private Set<String> targetUserIds;

    public MagnetoMessage() {
        this(null, 0L, null, null, null, null, null, null, null, null,
                new ArrayList<>(), null, new ArrayList<>(), new LinkedHashSet<>(),
                new ArrayList<>(), null, null, null);
    }

    public MagnetoMessage(String boardId, long emittedAt, String emittedBy, String websocketId, MagnetoMessageType type, String userId, String cardId, Board board, Card card, Card oldCard, List<Card> cards, Section section, List<Section> sections, LinkedHashSet<User> connectedUsers, List<CardEditingInformation> cardEditingInformations, MagnetoUserAction.ActionType actionType, String actionId, Long maxConnectedUsers) {
        this.boardId = boardId;
        this.emittedAt = emittedAt;
        this.emittedBy = emittedBy;
        this.websocketId = websocketId;
        this.type = type;
        this.userId = userId;
        this.cardId = cardId;
        this.board = board;
        this.card = card;
        this.oldCard = oldCard;
        this.cards = cards;
        this.section = section;
        this.sections = sections;
        this.cardEditingInformations = cardEditingInformations;
        this.actionType = actionType;
        this.actionId = actionId;
        this.connectedUsers = connectedUsers;
        this.maxConnectedUsers = maxConnectedUsers;
    }

    public MagnetoMessage(JsonObject jsonObject) {
        this.boardId = jsonObject.getString(Field.BOARDID, null);
        this.emittedAt = jsonObject.getLong(Field.EMITTEDAT, System.currentTimeMillis());
        this.emittedBy = jsonObject.getString(Field.EMITTEDBY, null);
        this.websocketId = jsonObject.getString(Field.WEBSOCKETID, null);

        String typeStr = jsonObject.getString(Field.TYPE, null);
        this.type = typeStr != null ? MagnetoMessageType.valueOf(typeStr) : null;

        this.userId = jsonObject.getString(Field.USERID, null);
        this.cardId = jsonObject.getString(Field.CARDID, null);

        if (jsonObject.containsKey(Field.BOARD) && jsonObject.getValue(Field.BOARD) instanceof JsonObject) {
            this.board = new Board(jsonObject.getJsonObject(Field.BOARD));
        } else {
            this.board = null;
        }

        if (jsonObject.containsKey(Field.CARD) && jsonObject.getValue(Field.CARD) instanceof JsonObject) {
            this.card = new Card(jsonObject.getJsonObject(Field.CARD));
        } else {
            this.card = null;
        }

        if (jsonObject.containsKey(Field.OLDCARD) && jsonObject.getValue(Field.OLDCARD) instanceof JsonObject) {
            this.oldCard = new Card(jsonObject.getJsonObject(Field.OLDCARD));
        } else {
            this.oldCard = null;
        }

        this.cards = new ArrayList<>();
        if (jsonObject.containsKey(Field.CARDS) && jsonObject.getValue(Field.CARDS) instanceof JsonArray) {
            JsonArray cardsArray = jsonObject.getJsonArray(Field.CARDS);
            for (int i = 0; i < cardsArray.size(); i++) {
                JsonObject cardJson = cardsArray.getJsonObject(i);
                if (cardJson != null) {
                    this.cards.add(new Card(cardJson));
                }
            }
        }

        if (jsonObject.containsKey(Field.SECTION) && jsonObject.getValue(Field.SECTION) instanceof JsonObject) {
            this.section = new Section(jsonObject.getJsonObject(Field.SECTION));
        } else {
            this.section = null;
        }

        this.sections = new ArrayList<>();
        if (jsonObject.containsKey(Field.SECTIONS) && jsonObject.getValue(Field.SECTIONS) instanceof JsonArray) {
            JsonArray sectionsArray = jsonObject.getJsonArray(Field.SECTIONS);
            for (int i = 0; i < sectionsArray.size(); i++) {
                JsonObject sectionJson = sectionsArray.getJsonObject(i);
                if (sectionJson != null) {
                    this.sections.add(new Section(sectionJson));
                }
            }
        }

        this.connectedUsers = new LinkedHashSet<>();
        if (jsonObject.containsKey(Field.CONNECTEDUSERS) && jsonObject.getValue(Field.CONNECTEDUSERS) instanceof JsonArray) {
            JsonArray usersArray = jsonObject.getJsonArray(Field.CONNECTEDUSERS);
            for (int i = 0; i < usersArray.size(); i++) {
                JsonObject userJson = usersArray.getJsonObject(i);
                if (userJson != null) {
                    User userInfo = new User(userJson.getString(Field.ID), userJson.getString(Field.USERNAME));
                    try {
                        if (userJson.containsKey(Field.ID)) userInfo.setUserId(userJson.getString(Field.ID));
                        if (userJson.containsKey(Field.USERNAME)) userInfo.setUsername(userJson.getString(Field.USERNAME));
                        if (userJson.containsKey(Field.LOGIN)) userInfo.setLogin(userJson.getString(Field.LOGIN));

                        this.connectedUsers.add(userInfo);
                    } catch (Exception e) {
                        String message = String.format("[Magneto@%s::MagnetoMessage] Error parsing UserInfos from JsonObject",
                                this.getClass().getSimpleName());
                        System.err.println(message + ": " + e.getMessage());
                    }
                }
            }
        }

        this.cardEditingInformations = new ArrayList<>();
        if (jsonObject.containsKey(Field.CARDEDITINGINFORMATIONS) && jsonObject.getValue(Field.CARDEDITINGINFORMATIONS) instanceof JsonArray) {
            JsonArray cardEditingInformationsArray = jsonObject.getJsonArray(Field.CARDEDITINGINFORMATIONS);
            for (int i = 0; i < cardEditingInformationsArray.size(); i++) {
                JsonObject cardEditingInformationJson = cardEditingInformationsArray.getJsonObject(i);
                if (cardEditingInformationJson != null) {
                    this.cardEditingInformations.add(new CardEditingInformation(cardEditingInformationJson));
                }
            }
        }

        this.actionType = null;
        this.actionId = jsonObject.getString(Field.ACTIONID, null);

        this.maxConnectedUsers = jsonObject.getLong(Field.MAXCONNECTEDUSERS, null);
    }

    public String getBoardId() {
        return boardId;
    }

    public long getEmittedAt() {
        return emittedAt;
    }

    public String getEmittedBy() {
        return emittedBy;
    }

    public String getWebsocketId() {
        return websocketId;
    }

    public MagnetoMessageType getType() {
        return type;
    }

    public String getUserId() {
        return userId;
    }

    public String getCardId() {
        return cardId;
    }

    public Board getBoard() {
        return board;
    }

    public Card getCard() {
        return card;
    }

    public Card getOldCard() {
        return oldCard;
    }

    public List<Card> getCards() {
        return cards;
    }

    public Section getSection() {
        return section;
    }

    public List<Section> getSections() {
        return sections;
    }

    public Set<User> getConnectedUsers() {
        return connectedUsers;
    }

    public Long getMaxConnectedUsers() {
        return maxConnectedUsers;
    }

    public Set<String> getTargetUserIds() {
        return targetUserIds;
    }

    public String getActionId() {
        return actionId;
    }

    public void setTargetUserIds(Set<String> targetUserIds) {
        this.targetUserIds = targetUserIds;
    }

    public boolean hasSpecificTargets() {
        return targetUserIds != null && !targetUserIds.isEmpty();
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();

        if (boardId != null) json.put(Field.BOARDID, boardId);
        json.put(Field.EMITTEDAT, emittedAt);
        if (emittedBy != null) json.put(Field.EMITTEDBY, emittedBy);
        if (websocketId != null) json.put(Field.WEBSOCKETID, websocketId);
        if (type != null) json.put(Field.TYPE, type.name());
        if (userId != null) json.put(Field.USERID, userId);
        if (cardId != null) json.put(Field.CARDID, cardId);
        if (maxConnectedUsers != null) json.put(Field.MAXCONNECTEDUSERS, maxConnectedUsers);

        if (board != null) json.put(Field.BOARD, board.toJson());
        if (card != null) json.put(Field.CARD, card.toJson());
        if (oldCard != null) json.put(Field.OLDCARD, oldCard.toJson());

        if (cards != null && !cards.isEmpty()) {
            JsonArray cardsArray = new JsonArray();
            for (Card card : cards) {
                if (card != null) {
                    cardsArray.add(card.toJson());
                }
            }
            json.put(Field.CARDS, cardsArray);
        }

        if (section != null) json.put(Field.SECTION, section.toJson());

        if (sections != null && !sections.isEmpty()) {
            JsonArray sectionsArray = new JsonArray();
            for (Section section : sections) {
                if (section != null) {
                    sectionsArray.add(section.toJson());
                }
            }
            json.put(Field.SECTIONS, sectionsArray);
        }

        if (connectedUsers != null && !connectedUsers.isEmpty()) {
            JsonArray usersArray = new JsonArray();
            for (User userInfo : connectedUsers) {
                if (userInfo != null) {
                    usersArray.add(userInfo.toJson());
                }
            }
            json.put(Field.CONNECTEDUSERS, usersArray);
        }

        if (cardEditingInformations != null) {
            JsonArray cardEditingArray = new JsonArray();
            for (CardEditingInformation cardEditingInformation : cardEditingInformations) {
                if (cardEditingInformation != null) {
                    cardEditingArray.add(cardEditingInformation.toJson());
                }
            }
            json.put(Field.CARDEDITINGINFORMATIONS, cardEditingArray);
        }

        return json;
    }

    @Override
    public String toString() {
        return "MagnetoMessage{" +
                "boardId='" + boardId + '\'' +
                ", emittedAt=" + emittedAt +
                ", emittedBy='" + emittedBy + '\'' +
                ", websocketId='" + websocketId + '\'' +
                ", type=" + type +
                ", userId='" + userId + '\'' +
                ", cardId='" + cardId + '\'' +
                ", board=" + board +
                ", card=" + card +
                ", oldCard=" + oldCard +
                ", cards=" + cards +
                ", section=" + section +
                ", sections=" + sections +
                ", connectedUsers=" + connectedUsers +
                ", cardEditingInformations=" + cardEditingInformations +
                ", maxConnectedUsers=" + maxConnectedUsers +
                '}';
    }


}
