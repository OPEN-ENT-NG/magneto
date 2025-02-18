package fr.cgi.magneto.model.properties;

import fr.cgi.magneto.core.enums.SlideResourceType;

public class SlideProperties {
    private String title;
    private String description;
    private String content;
    private String url;
    private String fileName;

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

        public Builder content(String content) {
            properties.content = content;
            return this;
        }

        public Builder url(String url) {
            properties.url = url;
            return this;
        }

        public Builder fileName(String fileName) {
            properties.fileName = fileName;
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
        return fileName != null && url != null;
    }

    private boolean isValidForLink() {
        return url != null && title != null;
    }

    private boolean isValidForMedia() {
        return url != null;
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

    public String getContent() {
        return content;
    }

    public String getUrl() {
        return url;
    }

    public String getFileName() {
        return fileName;
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