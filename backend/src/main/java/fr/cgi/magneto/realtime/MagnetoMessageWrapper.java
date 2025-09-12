package fr.cgi.magneto.realtime;

import fr.cgi.magneto.realtime.MagnetoMessage;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.apache.commons.collections4.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

public class MagnetoMessageWrapper {
    private final List<MagnetoMessage> messages;
    private final boolean allowInternal;
    private final boolean allowExternal;
    private final String exceptWSId;

    public MagnetoMessageWrapper(List<MagnetoMessage> messages, boolean allowInternal, boolean allowExternal) {
        this(messages, allowInternal, allowExternal, null);
    }

    public MagnetoMessageWrapper(List<MagnetoMessage> messages, boolean allowInternal, boolean allowExternal, String exceptWSId) {
        this.messages = messages;
        this.allowInternal = allowInternal;
        this.allowExternal = allowExternal;
        this.exceptWSId = exceptWSId;
    }

    public MagnetoMessageWrapper(JsonObject jsonObject) {
        this.messages = new ArrayList<>();

        // Extraction des messages du JsonObject
        if (jsonObject.containsKey("messages") && jsonObject.getValue("messages") instanceof JsonArray) { //TODO : fix all magic strings
            JsonArray messagesArray = jsonObject.getJsonArray("messages");
            for (int i = 0; i < messagesArray.size(); i++) {
                JsonObject messageJson = messagesArray.getJsonObject(i);
                if (messageJson != null) {
                    MagnetoMessage message = new MagnetoMessage(messageJson);
                    this.messages.add(message);
                }
            }
        }

        // Extraction des propriétés de diffusion
        this.allowInternal = jsonObject.getBoolean("allowInternal", true);
        this.allowExternal = jsonObject.getBoolean("allowExternal", true);
        this.exceptWSId = jsonObject.getString("exceptWSId", null);
    }

    public String getExceptWSId() {
        return exceptWSId;
    }

    public boolean isAllowExternal() {
        return allowExternal;
    }

    public List<MagnetoMessage> getMessages() {
        return messages;
    }

    public boolean isAllowInternal() {
        return allowInternal;
    }

    public boolean isNotEmpty(){
        return CollectionUtils.isNotEmpty(this.getMessages());
    }

    @Override
    public String toString() {
        return "MagnetoMessageWrapper{" +
                "messages=" + messages +
                ", allowInternal=" + allowInternal +
                ", allowExternal=" + allowExternal +
                ", exceptWSId='" + exceptWSId + '\'' +
                '}';
    }
}
