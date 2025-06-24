package fr.cgi.magneto.core.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    /** Users currently editing notes.*/
    private final List<CollaborativeWallEditingInformation> editing;
    /** Connected users*/
    private final Set<User> connectedUsers;

    public CollaborationUsersMetadata() {
        this.editing = new ArrayList<>();
        this.connectedUsers = new HashSet<>();
    }

    @JsonCreator
    public CollaborativeWallUsersMetadata(@JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing,
                                          @JsonProperty("connectedUsers") final Set<User> connectedUsers) {
        this.editing = editing;
        this.connectedUsers = connectedUsers;
    }

    public static CollaborativeWallUsersMetadata merge(final CollaborativeWallUsersMetadata context1,
                                                       final CollaborativeWallUsersMetadata context2) {
        final List<CollaborativeWallEditingInformation> concatEditing = new ArrayList<>();
        concatEditing.addAll(context1.getEditing());
        concatEditing.addAll(context2.getEditing());
        final Set<User> concatUsers = new HashSet<>();
        concatUsers.addAll(context1.getConnectedUsers());
        concatUsers.addAll(context2.getConnectedUsers());
        return new CollaborativeWallUsersMetadata(concatEditing, concatUsers);
    }

    public List<CollaborativeWallEditingInformation> getEditing() {
        return editing;
    }

    public Set<User> getConnectedUsers() {
        return connectedUsers;
    }

    public void addConnectedUser(final UserInfos user){
        this.connectedUsers.add(new User(user.getUserId(), user.getUsername(), user.getGroupsIds()));
    }

    public void removeConnectedUser(final String userId){
        this.connectedUsers.removeIf(user -> user.getId().equals(userId));
        this.getEditing().removeIf(info -> info.getUserId().equals(userId));
    }

}