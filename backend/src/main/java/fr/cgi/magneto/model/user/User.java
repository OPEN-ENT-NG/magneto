package fr.cgi.magneto.model.user;

import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.Objects;

public class User extends UserInfos implements Model<User> {

    private Boolean isReadOnly;

    public User(String id, String name) {
        super();
        this.setUserId(id);
        this.setUsername(name);
        this.isReadOnly = false;
    }

    public User(String id, String name, Boolean isReadOnly) {
        super();
        this.setUserId(id);
        this.setUsername(name);
        this.isReadOnly = isReadOnly;
    }

    public User(JsonObject user) {
        super();
        this.setUserId("");
        this.setUsername("");
        this.isReadOnly = false;
    }

    public Boolean isReadOnly() {
        return isReadOnly;
    }

    public User setReadOnly(Boolean readOnly) {
        isReadOnly = readOnly;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return null;
    }

    @Override
    public User model(JsonObject model) {
        return null;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (!(obj instanceof User)) return false;
        User user = (User) obj;
        return Objects.equals(this.getUserId(), user.getUserId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.getUserId());
    }
}
