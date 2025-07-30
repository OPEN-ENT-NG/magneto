package fr.cgi.magneto.model.user;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.core.enums.UserColor;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.Objects;

public class User extends UserInfos implements Model<User> {

    private Boolean isReadOnly;
    private UserColor color;

    public User(String id, String name, Boolean isReadOnly, UserColor color) {
        super();
        this.setUserId(id);
        this.setUsername(name);
        this.isReadOnly = isReadOnly;
        this.color = color;
    }

    public User(String id, String name) {
        super();
        this.setUserId(id);
        this.setUsername(name);
        this.isReadOnly = false;
        this.color = UserColor.DARK_GOLD;
    }

    public User(JsonObject user) {
        super();
        this.setUserId(user.getString("userId", user.getString("id", "")));
        this.setUsername(user.getString("username", ""));
        this.isReadOnly = user.getBoolean("readOnly", false);

        // Récupérer la couleur depuis le JSON
        String colorName = user.getString("color");
        if (colorName != null) {
            try {
                this.color = UserColor.valueOf(colorName);
            } catch (IllegalArgumentException e) {
                // Si la couleur n'existe pas, en assigner une par défaut
                this.color = UserColor.DARK_GOLD;
            }
        }
    }

    public Boolean isReadOnly() {
        return isReadOnly;
    }

    public User setReadOnly(Boolean readOnly) {
        this.isReadOnly = readOnly;
        return this;
    }

    public UserColor getColor() {
        return color;
    }

    public User setColor(UserColor color) {
        this.color = color;
        return this;
    }

    public String getColorHex() {
        return color.getHexCode();
    }

    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.ID, this.getUserId())
                .put(Field.USERNAME, this.getUsername())
                .put(Field.COLOR, this.getColorHex());
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
