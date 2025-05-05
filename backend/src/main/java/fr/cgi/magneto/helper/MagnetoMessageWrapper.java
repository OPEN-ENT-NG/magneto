package fr.cgi.magneto.helper;

import org.apache.commons.collections4.CollectionUtils;

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
}
