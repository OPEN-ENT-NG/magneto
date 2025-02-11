package fr.cgi.magneto.core.enums;

public enum ResourceType {
    TEXT,
    FILE,
    VIDEO,
    BOARD,
    IMAGE,
    TITLE,      // Première page du board
    DESCRIPTION,// Description du board
    SECTION;    // Titre de section
    
    public static ResourceType fromString(String type) {
        switch (type.toLowerCase()) {
            case "text":
                return TEXT;
            case "file":
                return FILE;
            case "video":
                return VIDEO;
            case "board":
                return BOARD;
            case "image":
                return IMAGE;
            default:
                throw new IllegalArgumentException("Unknown resource type: " + type);
        }
    }
}