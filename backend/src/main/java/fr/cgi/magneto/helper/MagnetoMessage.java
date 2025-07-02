package fr.cgi.magneto.helper;

import com.fasterxml.jackson.annotation.JsonIgnore;
import fr.cgi.magneto.core.enums.MagnetoMessageType;
import fr.cgi.magneto.core.events.MagnetoUserAction;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.user.User;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class MagnetoMessage {
    private final String boardId;
    private final long emittedAt;
    private final String emittedBy;
    /** Id of the websocket that generated the message .*/
    private final String websocketId;
    private final MagnetoMessageType type; // Replace MessageType with your class
    private final String userId;
    private final String cardId;
    private final Board board;
    private final Card card;
    private final Card oldCard; //Will this be useful? We'll see.. TODO remove it if useless
    private final List<Card> cards;
    private final Section section;
    private final List<Section> sections;
    private final Set<User> connectedUsers;
    private final MagnetoUserAction.ActionType actionType;
    private final String actionId;
    private final Long maxConnectedUsers;

    @JsonIgnore
    private Set<String> targetUserIds;

    public MagnetoMessage(String boardId, long emittedAt, String emittedBy, String websocketId, MagnetoMessageType type, String userId, String cardId, Board board, Card card, Card oldCard, List<Card> cards, Section section, List<Section> sections, Set<User> connectedUsers, MagnetoUserAction.ActionType actionType, String actionId, Long maxConnectedUsers) {
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
        this.actionType = actionType;
        this.actionId = actionId;
        this.connectedUsers = connectedUsers;
        this.maxConnectedUsers = maxConnectedUsers;
    }

    public MagnetoMessage(JsonObject jsonObject) {
        this.boardId = jsonObject.getString("boardId", null);
        this.emittedAt = jsonObject.getLong("emittedAt", System.currentTimeMillis());
        this.emittedBy = jsonObject.getString("emittedBy", null);
        this.websocketId = jsonObject.getString("websocketId", null);

        // Conversion du type en enum
        String typeStr = jsonObject.getString("type", null);
        this.type = typeStr != null ? MagnetoMessageType.valueOf(typeStr) : null;

        this.userId = jsonObject.getString("userId", null);
        this.cardId = jsonObject.getString("cardId", null);

        // Conversion des objets complexes
        if (jsonObject.containsKey("board") && jsonObject.getValue("board") instanceof JsonObject) {
            this.board = new Board(jsonObject.getJsonObject("board"));
        } else {
            this.board = null;
        }

        if (jsonObject.containsKey("card") && jsonObject.getValue("card") instanceof JsonObject) {
            this.card = new Card(jsonObject.getJsonObject("card"));
        } else {
            this.card = null;
        }

        if (jsonObject.containsKey("oldCard") && jsonObject.getValue("oldCard") instanceof JsonObject) {
            this.oldCard = new Card(jsonObject.getJsonObject("oldCard"));
        } else {
            this.oldCard = null;
        }

        // Conversion des collections
        this.cards = new ArrayList<>();
        if (jsonObject.containsKey("cards") && jsonObject.getValue("cards") instanceof JsonArray) {
            JsonArray cardsArray = jsonObject.getJsonArray("cards");
            for (int i = 0; i < cardsArray.size(); i++) {
                JsonObject cardJson = cardsArray.getJsonObject(i);
                if (cardJson != null) {
                    this.cards.add(new Card(cardJson));
                }
            }
        }

        // Section
        if (jsonObject.containsKey("section") && jsonObject.getValue("section") instanceof JsonObject) {
            this.section = new Section(jsonObject.getJsonObject("section"));
        } else {
            this.section = null;
        }

        // Sections list
        this.sections = new ArrayList<>();
        if (jsonObject.containsKey("sections") && jsonObject.getValue("sections") instanceof JsonArray) {
            JsonArray sectionsArray = jsonObject.getJsonArray("sections");
            for (int i = 0; i < sectionsArray.size(); i++) {
                JsonObject sectionJson = sectionsArray.getJsonObject(i);
                if (sectionJson != null) {
                    this.sections.add(new Section(sectionJson));
                }
            }
        }

        // Connected users
        this.connectedUsers = new HashSet<>();
        if (jsonObject.containsKey("connectedUsers") && jsonObject.getValue("connectedUsers") instanceof JsonArray) {
            JsonArray usersArray = jsonObject.getJsonArray("connectedUsers");
            for (int i = 0; i < usersArray.size(); i++) {
                JsonObject userJson = usersArray.getJsonObject(i);
                if (userJson != null) {
                    User userInfo = new User(userJson.getString("id"), userJson.getString("username"));
                    try {
                        // Remplir UserInfos avec les données de userJson
                        if (userJson.containsKey("id")) userInfo.setUserId(userJson.getString("id"));
                        if (userJson.containsKey("username")) userInfo.setUsername(userJson.getString("username"));
                        if (userJson.containsKey("login")) userInfo.setLogin(userJson.getString("login"));
                        //if (userJson.containsKey("displayName")) userInfo.setDisplayName(userJson.getString("displayName")); TODO why setDisplayName doesnt want to work??

                        this.connectedUsers.add(userInfo);
                    } catch (Exception e) {
                        String message = String.format("[Magneto@%s::MagnetoMessage] Error parsing UserInfos from JsonObject",
                                this.getClass().getSimpleName());
                        System.err.println(message + ": " + e.getMessage());
                    }
                }
            }
        }

        this.actionType = null;
        this.actionId = jsonObject.getString("actionId", null);

        // Maximum connected users
        this.maxConnectedUsers =  jsonObject.getLong("maxConnectedUsers", null);
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

    public void setTargetUserIds(Set<String> targetUserIds) {
        this.targetUserIds = targetUserIds;
    }

    public boolean hasSpecificTargets() {
        return targetUserIds != null && !targetUserIds.isEmpty();
    }

    public JsonObject toJson() {
        JsonObject json = new JsonObject();

        // Propriétés simples
        if (boardId != null) json.put("boardId", boardId);
        json.put("emittedAt", emittedAt);
        if (emittedBy != null) json.put("emittedBy", emittedBy);
        if (websocketId != null) json.put("websocketId", websocketId);
        if (type != null) json.put("type", type.name());
        if (userId != null) json.put("userId", userId);
        if (cardId != null) json.put("cardId", cardId);
        if (maxConnectedUsers != null) json.put("maxConnectedUsers", maxConnectedUsers);

        // Objets complexes
        if (board != null) json.put("board", board.toJson());
        if (card != null) json.put("card", card.toJson());
        if (oldCard != null) json.put("oldCard", oldCard.toJson());

        // Collections
        if (cards != null && !cards.isEmpty()) {
            JsonArray cardsArray = new JsonArray();
            for (Card card : cards) {
                if (card != null) {
                    cardsArray.add(card.toJson());
                }
            }
            json.put("cards", cardsArray);
        }

        if (section != null) json.put("section", section.toJson());

        if (sections != null && !sections.isEmpty()) {
            JsonArray sectionsArray = new JsonArray();
            for (Section section : sections) {
                if (section != null) {
                    sectionsArray.add(section.toJson());
                }
            }
            json.put("sections", sectionsArray);
        }

        // Connected users
        if (connectedUsers != null && !connectedUsers.isEmpty()) {
            JsonArray usersArray = new JsonArray();
            for (UserInfos userInfo : connectedUsers) {
                if (userInfo != null) {
                    JsonObject userJson = new JsonObject();
                    if (userInfo.getUserId() != null) userJson.put("id", userInfo.getUserId());
                    if (userInfo.getUsername() != null) userJson.put("username", userInfo.getUsername());
                    if (userInfo.getLogin() != null) userJson.put("login", userInfo.getLogin());
                    // Ajout d'autres propriétés de UserInfos si nécessaire

                    usersArray.add(userJson);
                }
            }
            json.put("connectedUsers", usersArray);
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
                ", maxConnectedUsers=" + maxConnectedUsers +
                '}';
    }
}
