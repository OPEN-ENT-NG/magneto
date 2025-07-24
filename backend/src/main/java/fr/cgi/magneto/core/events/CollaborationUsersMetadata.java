package fr.cgi.magneto.core.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fr.cgi.magneto.model.user.User;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Metadata of a wall concerning the actions of the users connected to it.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborationUsersMetadata {

    private final List<CardEditingInformation> editing;
    private final Set<User> connectedUsers;

    public CollaborationUsersMetadata() {
        this.editing = new ArrayList<>();
        this.connectedUsers = new HashSet<>();
    }

    @JsonCreator
    public CollaborationUsersMetadata(List<CardEditingInformation> editing, Set<User> connectedUsers) {
        this.editing = editing;
        this.connectedUsers = connectedUsers;
    }

    public List<CardEditingInformation> getEditing() {
        return editing;
    }

    public Set<User> getConnectedUsers() {
        return connectedUsers;
    }

    public void addConnectedUser(final UserInfos user, Boolean readOnly){
        this.connectedUsers.add(new User(user.getUserId(), user.getUsername(), readOnly));
    }

    public void removeConnectedUser(final String userId){
        this.connectedUsers.removeIf(user -> user.getUserId().equals(userId));
        this.getEditing().removeIf(info -> info.getUserId().equals(userId));
    }

    public boolean isUserReadOnly(String userId) {
        return connectedUsers.stream()
                .filter(user -> user.getUserId().equals(userId))
                .findFirst()
                .map(User::isReadOnly)
                .orElse(true);
    }
}