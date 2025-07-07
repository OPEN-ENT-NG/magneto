package fr.cgi.magneto.core.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.enums.MagnetoMessageType;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.comments.Comment;
import org.entcore.common.validation.ValidationException;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MagnetoUserAction {
    private final MagnetoMessageType type;
    private final List<Card> cards;
    private final String cardId;
    private final Card card;
    private final Board board;
    private final Section section;
    private final Comment comment;
    private final String commentId;
    private final ActionType actionType;
    private final String actionId;

    @JsonCreator
    public MagnetoUserAction(@JsonProperty("type") final MagnetoMessageType type,
                                       @JsonProperty("notes") final List<Card> cards,
                                       @JsonProperty("cardId") final String cardId,
                                       @JsonProperty("card") final Card card,
                                       @JsonProperty("board") final Board board,
                                       @JsonProperty("section") final Section section,
                                       @JsonProperty("comment") final Comment comment,
                                       @JsonProperty("commentId") final String commentId,
                                       @JsonProperty("actionType") final ActionType actionType,
                                       @JsonProperty("actionId") final String actionId) {
        this.type = type;
        this.cards = cards;
        this.cardId = cardId;
        this.card = card;
        this.board = board;
        this.section = section;
        this.comment = comment;
        this.commentId = commentId;
        this.actionType = actionType;
        this.actionId = actionId;
    }

    public MagnetoMessageType getType() {
        return type;
    }

    public List<Card> getCards() {
        return cards;
    }

    public String getCardId() {
        return cardId;
    }

    public Card getCard() {
        return card;
    }

    public Board getBoard() { return board; }

    public Section getSection() { return section; }

    public Comment getComment() { return comment; }

    public String getCommentId() { return commentId; }

    public ActionType getActionType() {
        return actionType;
    }

    public String getActionId() {
        return actionId;
    }

    public boolean isValid(){
        if(this.type==null){
            throw new ValidationException("wall.action.type.missing");
        }
        switch(this.type){
            case connection:
            case metadata:
            case disconnection:
            case ping:{
                // no required fields
                break;
            }
            case cardAdded:
            case cardMoved:
            case cardFavorite:
            case cardUpdated: {
                if(this.card == null){
                    throw new ValidationException("magneto.action.note.missing");
                }
                break;
            }
            case cardDeleted:
            case cardEditionStarted:
            case cardEditionEnded:{
                if(this.cardId == null){
                    throw new ValidationException("magneto.action.cardId.missing");
                }
                break;
            }
            case boardUpdated:{
                if(this.board == null){
                    throw new ValidationException("magneto.action.board.missing");
                }
                break;
            }
            case sectionUpdated:{
                if (this.section == null){
                    throw new ValidationException("magneto.action.section.missing");
                }
                break;
            }
        }
        return true;
    }

    @Override
    public String toString() {
        return "MagnetoUserAction{" +
                "type=" + type +
                ", cards=" + cards +
                ", cardId='" + cardId + '\'' +
                ", card=" + card +
                ", board=" + board +
                ", section=" + section +
                ", comment=" + comment +
                ", actionType=" + actionType +
                ", actionId='" + actionId + '\'' +
                '}';
    }

    public enum ActionType{
        Do, Undo, Redo
    }
}
