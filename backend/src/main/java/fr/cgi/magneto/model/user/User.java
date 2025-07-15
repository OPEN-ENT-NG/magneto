package fr.cgi.magneto.model.user;

import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.Objects;

public class User extends UserInfos implements Model<User> {

    public User(String id, String name) {
        super();
        this.setUserId(id);
        this.setUsername(name);
    }

    public User(JsonObject user) {
        super();
        this.setUserId("");
        this.setUsername("");
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
