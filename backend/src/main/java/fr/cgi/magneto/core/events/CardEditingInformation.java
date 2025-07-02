package fr.cgi.magneto.core.events;

/**
 * Information about a card being edited by a user.
 */
public class CardEditingInformation {

    private final String userId;
    private final String cardId;
    private final long since;

    public CardEditingInformation(String userId, String cardId, long since) {
        this.userId = userId;
        this.cardId = cardId;
        this.since = since;
    }

    public String getUserId() {
        return userId;
    }

    public String getNoteId() {
        return cardId;
    }

    public long getSince() {
        return since;
    }
}