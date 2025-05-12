package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.enums.MagnetoMessageType;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
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
    private final Set<UserInfos> connectedUsers;
    //private final MagnetoUserAction.ActionType actionType;
    //private final String actionId;
    private final Long maxConnectedUsers;

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
                    // Suppose qu'il existe un constructeur pour UserInfos prenant un JsonObject
                    UserInfos userInfo = new UserInfos();
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

    public Set<UserInfos> getConnectedUsers() {
        return connectedUsers;
    }

    public Long getMaxConnectedUsers() {
        return maxConnectedUsers;
    }
}
