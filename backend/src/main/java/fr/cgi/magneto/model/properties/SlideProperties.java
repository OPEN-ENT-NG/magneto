package fr.cgi.magneto.model.properties;

import fr.cgi.magneto.core.enums.SlideResourceType;

public class SlideProperties {
    private String title;
    private String description;
    private String caption;
    private String content;
    private String resourceUrl;
    private String resourceId;
    private String extension;
    private String fileName;
    private byte[] resourceData;

    private String ownerName;
    private String modificationDate;
    private Integer resourceNumber;
    private Boolean isShare;
    private Boolean isPublic;

    private SlideProperties() {
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

        public Builder extension(String extension) {
            properties.extension = extension;
            return this;
        }

        public Builder fileName(String fileName) {
            properties.fileName = fileName;
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

        public SlideProperties build() {
            return properties;
        }
    }

    public boolean isValidForType(SlideResourceType type) {
        if (type == null)
            return false;

        switch (type) {
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

    private boolean isValidForText() {
        return title != null && description != null;
    }

    private boolean isValidForFile() {
        return fileName != null && resourceUrl != null;
    }

    private boolean isValidForLink() {
        return resourceUrl != null && title != null;
    }

    private boolean isValidForMedia() {
        return title != null && caption != null && extension != null && resourceData != null;
    }

    private boolean isValidForBoard() {
        return ownerName != null
                && modificationDate != null
                && resourceNumber != null
                && isShare != null
                && isPublic != null;
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

    public String getExtension() {
        return extension;
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