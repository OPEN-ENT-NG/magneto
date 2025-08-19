package fr.cgi.magneto.core.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fr.cgi.magneto.model.user.User;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * Metadata of a wall concerning the actions of the users connected to it.
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
    public CollaborationUsersMetadata(List<CardEditingInformation> editing, LinkedHashSet<User> connectedUsers) {
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
}