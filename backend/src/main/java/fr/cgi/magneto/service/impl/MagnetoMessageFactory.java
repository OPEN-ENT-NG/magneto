package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.enums.MagnetoMessageType;
import fr.cgi.magneto.core.events.CollaborationUsersMetadata;
import fr.cgi.magneto.core.events.MagnetoUserAction;
import fr.cgi.magneto.helper.MagnetoMessage;
import fr.cgi.magneto.model.Section;
import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;

import java.util.List;

public class MagnetoMessageFactory {
    private final String serverId;

    /**
     * @param serverId If of the server that will generate the messages.
     */
    public MagnetoMessageFactory(String serverId) {
        this.serverId = serverId;
    }

    public MagnetoMessage connection(final String boardId, final String wsId, final String userId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.connection,
                userId, null, null, null, null, null,null, null, null,
                MagnetoUserAction.ActionType.Do, null, null);
    }

    public MagnetoMessage disconnection(final String boardId, final String wsId, final String userId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.disconnection,
                userId, null, null, null, null, null,null, null, null,
                MagnetoUserAction.ActionType.Do, null, null);
    }

    public MagnetoMessage metadata(final String boardId, final String wsId, final String userId,
                                   final CollaborationUsersMetadata magnetoContext, final Long maxUser) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.metadata,
                userId, null, null, null, null, null, null,null, magnetoContext.getConnectedUsers(),
                MagnetoUserAction.ActionType.Do, null, maxUser);
    }

    public MagnetoMessage ping(final String boardId, final String wsId, final String userId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.ping,
                userId, null, null, null, null, null,
                null, null, null, MagnetoUserAction.ActionType.Do, null, null);
    }

    public MagnetoMessage boardUpdated(final String boardId, final String wsId, final String userId, final Board board, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.boardUpdated,
                userId, null, board, null, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardAdded(final String boardId, final String wsId, final String userId, final Board board, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.cardAdded, userId, null, board, null, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardUpdated(final String boardId, final String wsId, final String userId, final Card card, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.cardUpdated,
                userId, null, null, card, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage sectionUpdated(final String boardId, final String wsId, final String userId, final Section section, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.sectionUpdated,
                userId, null, null, null, null, null,
                section, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardFavorite(final String boardId, final String wsId, final String userId, final Card card, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.cardFavorite,
                userId, null, null, card, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage commentAdded(final String boardId, final String wsId, final String userId, final Card card, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.commentAdded,
                userId, null, null, card, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage commentDeleted(final String boardId, final String wsId, final String userId, final Card card, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.commentDeleted,
                userId, null, null, card, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage commentEdited(final String boardId, final String wsId, final String userId, final Card card, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.commentEdited,
                userId, null, null, card, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardDuplicated(final String boardId, final String wsId, final String userId, final List<Card> cards, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.cardDuplicated,
                userId, null, null, null, null, cards,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage sectionDuplicated(final String boardId, final String wsId, final String userId, final Board board, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.sectionDuplicated,
                userId, null, board, null, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage sectionAdded(final String boardId, final String wsId, final String userId, final Section section, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.sectionAdded,
                userId, null, null, null, null, null,
                section, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardsDeleted(final String boardId, final String wsId, final String userId, final List<Card> cards, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.cardsDeleted,
                userId, null, null, null, null, cards,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage sectionsDeleted(final String boardId, final String wsId, final String userId, final Board board, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.sectionsDeleted,
                userId, null, board, null, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardMoved(final String boardId, final String wsId, final String userId, final Board board, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.cardMoved,
                userId, null, board, null, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage boardMessage(final String boardId, final String wsId, final String userId, final Board board, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.boardMessage,
                userId, null, board, null, null, null,
                null, null, null, actionType, actionId, null);
    }

    /*public MagnetoMessage cardEditionStarted(final String boardId, final String wsId, final String userId, final JsonObject note, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return noteAdded(boardId, wsId, userId, CollaborativeWallNote.fromJson(note), actionType, actionId);
    }

    public MagnetoMessage cardEditionEnded(final String boardId, final String wsId, final String userId, final CollaborativeWallNote note, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return new MagnetoMessage(boardId, System.currentTimeMillis(), serverId, wsId,
                MagnetoMessageType.noteMoved, null, null,
                userId, null, null, note, null, null,
                null, null, null, actionType, actionId, null);
    }

    public MagnetoMessage cardMoved(final String boardId, final String wsId, final String userId, final JsonObject note, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return noteMoved(boardId, wsId, userId, CollaborativeWallNote.fromJson(note), actionType, actionId);
    }

    public MagnetoMessage cardDeleted(final String boardId, final String wsId, final String userId, final JsonObject previousnote, final JsonObject note, final MagnetoUserAction.ActionType actionType, final String actionId) {
        return noteUpdated(boardId, wsId, userId, CollaborativeWallNote.fromJson(previousnote), CollaborativeWallNote.fromJson(note), actionType, actionId);
    }*/
}
