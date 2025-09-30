package fr.cgi.magneto.realtime.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.model.user.User;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * Metadata of a board concerning the actions of the users connected to it.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborationUsersMetadata {

    private final List<CardEditingInformation> editing;
    private LinkedHashSet<User> connectedUsers;

    public CollaborationUsersMetadata() {
        this.editing = new ArrayList<>();
        this.connectedUsers = new LinkedHashSet<>();
    }

    @JsonCreator
    public CollaborationUsersMetadata(
            @JsonProperty("editing") List<CardEditingInformation> editing,
            @JsonProperty("connectedUsers") LinkedHashSet<User> connectedUsers) {
        this.editing = editing;
        this.connectedUsers = connectedUsers;
    }

    public List<CardEditingInformation> getEditing() {
        return editing;
    }

    public LinkedHashSet<User> getConnectedUsers() {
        return connectedUsers;
    }

    public void addConnectedUser(final User user){
        if (!this.connectedUsers.contains(user)) {
            LinkedHashSet<User> newSet = new LinkedHashSet<>();
            newSet.add(user);
            newSet.addAll(this.connectedUsers);
            this.connectedUsers = newSet;
        }
    }

    public void removeConnectedUser(final String userId){
        this.connectedUsers.removeIf(user -> user.getUserId().equals(userId));
        this.getEditing().removeIf(info -> info.getUserId().equals(userId));
    }

    /**
     * Fusionne deux instances de CollaborationUsersMetadata
     */
    public static CollaborationUsersMetadata merge(CollaborationUsersMetadata first, CollaborationUsersMetadata second) {
        if (first == null && second == null) {
            return new CollaborationUsersMetadata();
        }
        if (first == null) {
            return second;
        }
        if (second == null) {
            return first;
        }

        CollaborationUsersMetadata merged = new CollaborationUsersMetadata();

        // Fusionner les utilisateurs connectés (LinkedHashSet évite les doublons)
        merged.connectedUsers.addAll(first.getConnectedUsers());
        merged.connectedUsers.addAll(second.getConnectedUsers());

        // Fusionner les informations d'édition
        merged.editing.addAll(first.getEditing());
        merged.editing.addAll(second.getEditing());

        // Supprimer les doublons d'édition (même userId + même cardId)
        List<CardEditingInformation> uniqueEditing = new ArrayList<>();
        for (CardEditingInformation info : merged.editing) {
            boolean isDuplicate = uniqueEditing.stream().anyMatch(existing ->
                    existing.getUserId().equals(info.getUserId()) &&
                            existing.getCardId().equals(info.getCardId()));

            if (!isDuplicate) {
                uniqueEditing.add(info);
            }
        }
        merged.editing.clear();
        merged.editing.addAll(uniqueEditing);

        return merged;
    }
}