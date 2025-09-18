package fr.cgi.magneto.realtime.events;

import fr.cgi.magneto.core.enums.RightLevel;
import io.vertx.core.json.JsonObject;

public class UserBoardRights {
    private RightLevel maxRight = RightLevel.NONE;

    // Constructeurs
    public UserBoardRights() {}

    public UserBoardRights(RightLevel maxRight) {
        this.maxRight = maxRight;
    }

    // Getters basés sur la hiérarchie
    public boolean hasRead() {
        return maxRight.isGreaterOrEqualTo(RightLevel.READ);
    }

    public boolean isReadOnly() {
        return !hasContrib();
    }

    public boolean hasContrib() {
        return maxRight.isGreaterOrEqualTo(RightLevel.CONTRIB);
    }

    public boolean hasPublish() {
        return maxRight.isGreaterOrEqualTo(RightLevel.PUBLISH);
    }

    public boolean hasManager() {
        return maxRight.isGreaterOrEqualTo(RightLevel.MANAGER);
    }

    public boolean hasOwner() {
        return maxRight.isGreaterOrEqualTo(RightLevel.OWNER);
    }

    public RightLevel getMaxRight() {
        return maxRight;
    }

    public void setMaxRight(RightLevel maxRight) {
        this.maxRight = maxRight;
    }

    public boolean hasAnyRight() {
        return maxRight != RightLevel.NONE;
    }

    public JsonObject toJson() {
        return new JsonObject()
                .put("maxRight", maxRight.name().toLowerCase())
                .put("read", hasRead())
                .put("contrib", hasContrib())
                .put("publish", hasPublish())
                .put("manager", hasManager())
                .put("owner", hasOwner());
    }
}
