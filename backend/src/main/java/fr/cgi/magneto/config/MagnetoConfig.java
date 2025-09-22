package fr.cgi.magneto.config;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.constants.Field.*;

public class MagnetoConfig {

    private final String host;
    private final String mode;
    private final WebsocketConfig websocketConfig;
    private final Integer magnetoUpdateFrequency;
    private final Boolean magnetoStandalone;
    private final String themePlatform;
    private final Boolean isMultiCluster;
    private final List<String> allowedOrigins;

    private final Integer DEFAULT_MAGNETO_UPDATE_FREQUENCY = 10 * 1000; //refresh every 10 seconds by default


    public MagnetoConfig(JsonObject config) {
        this.host = config.getString(Field.HOST);
        this.mode = config.getString(Field.MODE);
        this.websocketConfig = new WebsocketConfig(config.getJsonObject(Field.WEBSOCKET_CONFIG_HYPHENS));
        final int tempFrequency = config.getInteger(Field.MAGNETO_UPDATE_FREQUENCY, DEFAULT_MAGNETO_UPDATE_FREQUENCY);
        this.magnetoUpdateFrequency = Math.max(tempFrequency, DEFAULT_MAGNETO_UPDATE_FREQUENCY);
        this.magnetoStandalone = config.getBoolean(Field.MAGNETO_STANDALONE_CONFIG, false);
        this.themePlatform = config.getString(Field.KEBAB_THEME_PLATFORM, "default");
        this.isMultiCluster = config.getBoolean(IS_MULTI_CLUSTER, false);
        this.allowedOrigins = config.getJsonArray(Field.ALLOWED_ORIGINS, new JsonArray())
                .stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }

    public String getThemePlatform() {
        return this.themePlatform;
    }

    public String host() {
        return this.host;
    }

    public String mode() {
        return this.mode;
    }

    public WebsocketConfig websocketConfig() {
        return this.websocketConfig;
    }

    public Integer magnetoUpdateFrequency() {
        return this.magnetoUpdateFrequency;
    }

    public Boolean getMagnetoStandalone() {
        return magnetoStandalone;
    }

    public Boolean getIsMultiCluster() {
        return this.isMultiCluster;
    }

    public List<String> getAllowedOrigins() {
        return allowedOrigins;
    }

    public static class WebsocketConfig {
        private static final int DEFAULT_PORT = 9091;
        public static final String DEFAULT_ENDPOINTPROXY = "/magneto/eventbus";
        private static final int DEFAULT__MAX_USERS = 500;
        private static final int DEFAULT_MAX_USERS_PER_BOARD = 100;
        private final Integer port;
        private final String endpointProxy;
        private final Integer maxUsers;
        private final Integer maxUsersPerBoard;

        public WebsocketConfig(JsonObject websocketConfig) {
            this.port = websocketConfig.getInteger(WSPORT, DEFAULT_PORT);
            this.endpointProxy = websocketConfig.getString(ENDPOINT_PROXY_HYPHENS, DEFAULT_ENDPOINTPROXY);
            this.maxUsers = websocketConfig.getInteger(MAX_USERS, DEFAULT__MAX_USERS);
            this.maxUsersPerBoard = websocketConfig.getInteger(MAX_USERS_PER_BOARD, DEFAULT_MAX_USERS_PER_BOARD);
        }

        public Integer getPort() {
            return this.port;
        }
        //TODO utilisation de ce endPointProxy ? (essentiellement vers le front mais vraiment used ?)
        public String getEndpointProxy() {
            return this.endpointProxy;
        }
        public Integer getMaxUsers() {
            return this.maxUsers;
        }
        public Integer getMaxUsersPerBoard() {
            return this.maxUsersPerBoard;
        }

    }
}
