package fr.cgi.magneto.core.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.enums.MagnetoMessageType;
import fr.cgi.magneto.model.SectionPayload;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.cards.CardPayload;
import fr.cgi.magneto.model.comments.Comment;
import org.entcore.common.validation.ValidationException;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class MagnetoUserAction {
    private final MagnetoMessageType type;
    private final List<Card> cards;
    private final String cardId;
    private final List<String> cardIds;
    private final CardPayload card;
    private final Board board;
    private final String boardId;
    private final SectionPayload section;
    private final List<String> sectionIds;
    private final Comment comment;
    private final String commentId;
    private final Boolean isLiked;
    private final Boolean deleteCards;
    private final ActionType actionType;
    private final String actionId;

    @JsonCreator
    public MagnetoUserAction(@JsonProperty("type") final MagnetoMessageType type,
                                       @JsonProperty("notes") final List<Card> cards,
                                       @JsonProperty("cardId") final String cardId,
                                       @JsonProperty("cardIds") final List<String> cardIds,
                                       @JsonProperty("card") final CardPayload card,
                                       @JsonProperty("board") final Board board,
                                       @JsonProperty("boardId") final String boardId,
                                       @JsonProperty("section") final SectionPayload section,
                                       @JsonProperty("sectionIds") final List<String> sectionIds,
                                       @JsonProperty("comment") final Comment comment,
                                       @JsonProperty("commentId") final String commentId,
                                       @JsonProperty("isLiked") final Boolean isLiked,
                                       @JsonProperty("deleteCards") final Boolean deleteCards,
                                       @JsonProperty("actionType") final ActionType actionType,
                                       @JsonProperty("actionId") final String actionId) {
        this.type = type;
        this.cards = cards;
        this.cardId = cardId;
        this.cardIds = cardIds;
        this.card = card;
        this.board = board;
        this.boardId = boardId;
        this.section = section;
        this.sectionIds = sectionIds;
        this.comment = comment;
        this.commentId = commentId;
        this.isLiked = isLiked;
        this.deleteCards = deleteCards;
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

    public CardPayload getCard() {
        return card;
    }

    public Board getBoard() { return board; }

    public String getBoardId() { return boardId; }

    public SectionPayload getSection() { return section; }

    public Comment getComment() { return comment; }

    public String getCommentId() { return commentId; }

    public Boolean getIsLiked() { return isLiked; }

    public Boolean getDeleteCards() { return deleteCards; }

    public ActionType getActionType() {
        return actionType;
    }

    public String getActionId() {
        return actionId;
    }

    public List<String> getCardsIds() { return cardIds; }

    public List<String> getSectionIds() { return sectionIds; }

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
            case cardsDeleted: {
                if (this.cardIds == null && boardId == null) {
                    throw new ValidationException("magneto.action.note.missing");
                }
                break;
            }
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
                ", cardIds='" + cardIds + '\'' +
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
