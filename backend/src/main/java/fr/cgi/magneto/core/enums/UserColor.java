package fr.cgi.magneto.core.enums;

import java.util.Arrays;
import java.util.List;

public enum UserColor {
    DARK_GOLD("#B59021"),
    FOREST_GREEN("#009432"),
    SKY_BLUE("#3498DB"),
    DEEP_BLUE("#1E3799"),
    LAVENDER_PURPLE("#9B59B6"),
    BURNT_ORANGE("#D35400"),
    STONE_GRAY("#84817A");

    private final String hexCode;

    UserColor(String hexCode) {
        this.hexCode = hexCode;
    }

    public static List<UserColor> getAvailableColors() {
        return Arrays.asList(values());
    }

    public String getHexCode() {
        return hexCode;
    }
}
