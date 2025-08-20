package fr.cgi.magneto.core.enums;

public enum RightLevel {
    NONE(0),
    READ(1),
    CONTRIB(2),
    PUBLISH(3),
    MANAGER(4),
    OWNER(5);

    private final int level;

    RightLevel(int level) {
        this.level = level;
    }

    public boolean isGreaterOrEqualTo(RightLevel other) {
        return this.level >= other.level;
    }

    public int getLevel() {
        return level;
    }
}
