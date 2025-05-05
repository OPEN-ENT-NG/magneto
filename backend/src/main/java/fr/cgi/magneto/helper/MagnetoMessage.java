package fr.cgi.magneto.helper;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.enums.MagnetoMessageType;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import org.entcore.common.user.UserInfos;

import java.util.List;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
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

    @JsonCreator
    public MagnetoMessage(@JsonProperty("boardId") final String boardId,
                                    @JsonProperty("emittedAt") final long emittedAt,
                                    @JsonProperty("emittedBy") final String emittedBy,
                                    @JsonProperty("websocketId") final String websocketId,
                                    @JsonProperty("type") final MagnetoMessageType type,
                                    @JsonProperty("userId") final String userId,
                                    @JsonProperty("board") final Board board,
                                    @JsonProperty("cardId") final String cardId,
                                    @JsonProperty("card") final Card card,
                                    @JsonProperty("oldCard") final Card oldCard,
                                    @JsonProperty("cards") List<Card> cards,
                                    @JsonProperty("connectedUsers") final Set<UserInfos> connectedUsers,
                                    @JsonProperty("section") final Section section,
                                    @JsonProperty("sections") final List<Section> sections,
                                    //@JsonProperty("actionType") final CollaborativeWallUserAction.ActionType actionType,
                                    //@JsonProperty("actionId") final String actionId,
                                    @JsonProperty("maxConnectedUsers") final Long maxConnectedUsers) {
        this.boardId = boardId;
        this.emittedAt = emittedAt;
        this.emittedBy = emittedBy;
        this.websocketId = websocketId;
        this.type = type;
        this.userId = userId;
        this.board = board;
        this.cardId = cardId;
        this.card = card;
        this.oldCard = oldCard;
        this.cards = cards;
        this.connectedUsers = connectedUsers;
        this.section = section;
        this.sections = sections;
        //this.actionType = actionType;
        //this.actionId = actionId;
        this.maxConnectedUsers = maxConnectedUsers;
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
