package fr.cgi.magneto.core.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SortOrCreateByEnum {
    // Pour le mode libre (free)
    START("start"),
    END("end"),

    // Pour le mode ordonné (ordered)
    ALPHABETICAL("alphabetical"),
    ANTI_ALPHABETICAL("anti-alphabetical"),
    NEWEST_FIRST("newest-first"),
    OLDEST_FIRST("oldest-first");

    private final String value;

    SortOrCreateByEnum(String value) {
        this.value = value;
    }

    @JsonCreator
    public static SortOrCreateByEnum fromValue(String value) {
        for (SortOrCreateByEnum strategy : SortOrCreateByEnum.values()) {
            if (strategy.value.equals(value)) {
                return strategy;
            }
        }
        throw new IllegalArgumentException("Unknown SortOrCreateByEnum value: " + value);
    }

    @JsonValue
    public String getValue() {
        return this.value;
    }

    public boolean isFreePositionStrategy() {
        return this == START || this == END;
    }

    public boolean isOrderedPositionStrategy() {
        return this == ALPHABETICAL || this == ANTI_ALPHABETICAL ||
                this == NEWEST_FIRST || this == OLDEST_FIRST;
    }

    @Override
    public String toString() {
        return this.value;
    }

}