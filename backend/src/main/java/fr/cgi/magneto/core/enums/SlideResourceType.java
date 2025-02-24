package fr.cgi.magneto.core.enums;

public enum SlideResourceType {
    TEXT("text"),
    IMAGE("image"),
    VIDEO("video"),
    AUDIO("audio"),
    PDF("pdf"),
    SHEET("sheet"),
    FILE("file"),
    LINK("link"),
    BOARD("board"),
    EMBEDDER("embedder"),
    HYPERLINK("hyperlink"),
    DEFAULT("default");

    private final String value;

    SlideResourceType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SlideResourceType fromString(String text) {
        for (SlideResourceType type : SlideResourceType.values()) {
            if (type.value.equalsIgnoreCase(text)) {
                return type;
            }
        }
        return DEFAULT;
    }
}