package fr.cgi.magneto.model.share;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.List;

public class SharedElem {
    private String typeId;
    private String id;
    List<String> rights;

    public SharedElem() {
        rights = new ArrayList<>();
    }

    public String getTypeId() {
        return typeId;
    }

    public void setTypeId(String typeId) {
        this.typeId = typeId;

    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public List<String> getRights() {
        return rights;
    }

    public void addRight(String right) {
        this.rights.add(right);
    }

    public boolean hasSameId(SharedElem elem) {
        return this.typeId.equals(elem.getTypeId()) && this.id.equals(elem.getId());
    }

    public void set(JsonObject model) {
        if (model.containsKey(Field.USERID)) {
            this.setTypeId(Field.USERID);
            this.setId(model.getString(Field.USERID));
        }
        if (model.containsKey(Field.GROUPID)) {
            this.setTypeId(Field.GROUPID);
            this.setId(model.getString(Field.GROUPID));
        }
        if (model.containsKey(Field.BOOKMARKID)) {
            this.setTypeId(Field.BOOKMARKID);
            this.setId(model.getString(Field.BOOKMARKID));
        }
        model.forEach(entry -> {
            if (!entry.getKey().equals(Field.USERID) && !entry.getKey().equals(Field.GROUPID) && !entry.getKey().equals(Field.BOOKMARKID)) {
                this.addRight(entry.getKey());
            }
        });
    }

    public JsonObject toJson() {
        JsonObject result = new JsonObject().put(typeId, id);
        this.rights.forEach(right -> result.put(right, true));
        return result;
    }
}
