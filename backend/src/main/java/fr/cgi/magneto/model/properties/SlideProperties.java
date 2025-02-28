package fr.cgi.magneto.model.properties;

import fr.cgi.magneto.core.enums.SlideResourceType;
import fr.cgi.magneto.helper.I18nHelper;
import io.vertx.core.json.JsonObject;

public class SlideProperties {
    private String title;
    private String description;
    private String caption;
    private String content;
    private String resourceUrl;
    private String resourceId;
    private String fileName;
    private byte[] resourceData;
    private String contentType;
    private String link;
    private JsonObject i18ns;
    private I18nHelper i18nHelper;

    private String ownerName;
    private String modificationDate;
    private Integer resourceNumber;
    private Boolean isShare;
    private Boolean isPublic;

    private SlideProperties() {
    }

    private boolean isValidForTitle() {
        return title != null && description != null && ownerName != null && modificationDate != null
                && resourceData != null && contentType != null;
    }

    public static class Builder {
        private final SlideProperties properties;

        public Builder() {
            properties = new SlideProperties();
        }

        public Builder title(String title) {
            properties.title = title;
            return this;
        }

        public Builder description(String description) {
            properties.description = description;
            return this;
        }

        public Builder caption(String caption) {
            properties.caption = caption;
            return this;
        }

        public Builder content(String content) {
            properties.content = content;
            return this;
        }

        public Builder resourceUrl(String resourceUrl) {
            properties.resourceUrl = resourceUrl;
            return this;
        }

        public Builder resourceId(String resourceId) {
            properties.resourceId = resourceId;
            return this;
        }

        public Builder contentType(String contentType) {
            properties.contentType = contentType;
            return this;
        }

        public Builder fileName(String fileName) {
            properties.fileName = fileName;
            return this;
        }

        public Builder link(String link) {
            properties.link = link;
            return this;
        }

        public Builder i18ns(JsonObject i18ns) {
            properties.i18ns = i18ns;
            return this;
        }

        public Builder resourceData(byte[] resourceData) {
            properties.resourceData = resourceData;
            return this;
        }

        // Propriétés spécifiques board
        public Builder ownerName(String ownerName) {
            properties.ownerName = ownerName;
            return this;
        }

        public Builder modificationDate(String modificationDate) {
            properties.modificationDate = modificationDate;
            return this;
        }

        public Builder resourceNumber(Integer resourceNumber) {
            properties.resourceNumber = resourceNumber;
            return this;
        }

        public Builder isShare(Boolean isShare) {
            properties.isShare = isShare;
            return this;
        }

        public Builder isPublic(Boolean isPublic) {
            properties.isPublic = isPublic;
            return this;
        }

        public Builder i18nHelper(I18nHelper i18nHelper) {
            properties.i18nHelper = i18nHelper;
            return this;
        }

        public SlideProperties build() {
            return properties;
        }
    }

    public boolean isValidForType(SlideResourceType type) {
        if (type == null)
            return false;

        switch (type) {
            case TITLE:
                return isValidForTitle();
            case DESCRIPTION:
                return isValidForDescription();
            case TEXT:
                return isValidForText();
            case FILE:
            case PDF:
                return isValidForFile();
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                return isValidForLink();
            case IMAGE:
            case VIDEO:
            case AUDIO:
                return isValidForMedia();
            case BOARD:
                return isValidForBoard();
            default:
                return false;
        }
    }

    public I18nHelper getI18nHelper() {
        return i18nHelper;
    }

    private boolean isValidForDescription() { return title != null; }

    private boolean isValidForText() {
        return title != null;
    }

    private boolean isValidForFile() {
        return fileName != null && resourceUrl != null && title != null && caption != null;
    }

    private boolean isValidForLink() {
        return resourceUrl != null && title != null && caption != null && resourceData != null && contentType != null;
    }

    private boolean isValidForMedia() {
        return title != null && caption != null && contentType != null && resourceData != null;
    }

    private boolean isValidForBoard() {
        return title != null && ownerName != null
                && link != null
                && caption != null
                && modificationDate != null
                && resourceNumber != null
                && isShare != null
                && contentType != null
                && resourceData != null
                && isPublic != null
                && !i18ns.isEmpty();
    }

    // Getters
    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCaption() {
        return caption;
    }

    public String getContent() {
        return content;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getContentType() {
        return contentType;
    }

    public String getLink() {
        return link;
    }

    public JsonObject getI18ns() {
        return i18ns;
    }

    public String getFileName() {
        return fileName;
    }

    public byte[] getResourceData() {
        return resourceData;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public Integer getResourceNumber() {
        return resourceNumber;
    }

    public Boolean getIsShare() {
        return isShare;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }
}