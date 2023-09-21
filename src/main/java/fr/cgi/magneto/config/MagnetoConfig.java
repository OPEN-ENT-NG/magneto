package fr.cgi.magneto.config;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonObject;

public class MagnetoConfig {

    private final String host;
    private final String mode;
    private final WebsocketConfig websocketConfig;
    private final Integer magnetoUpdateFrequency;

    private final Integer DEFAULT_MAGNETO_UPDATE_FREQUENCY = 10 * 1000; //refresh every 10 seconds by default

    public MagnetoConfig(JsonObject config) {
        this.host = config.getString(Field.HOST);
        this.mode = config.getString(Field.MODE);
        this.websocketConfig = new WebsocketConfig(config.getJsonObject(Field.WEBSOCKET_CONFIG_HYPHENS));
        final int tempFrequency = config.getInteger(Field.MAGNETO_UPDATE_FREQUENCY, DEFAULT_MAGNETO_UPDATE_FREQUENCY);
        this.magnetoUpdateFrequency = Math.max(tempFrequency, DEFAULT_MAGNETO_UPDATE_FREQUENCY);
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

    public static class WebsocketConfig {
        public static final int DEFAULT_PORT = 4404;
        public static final String DEFAULT_ENDPOINTPROXY = "/magneto/eventbus";
        private final Integer port;
        private final String endpointProxy;

        public WebsocketConfig(JsonObject websocketConfig) {
            this.port = websocketConfig.getInteger(Field.WSPORT, DEFAULT_PORT);
            this.endpointProxy = websocketConfig.getString(Field.ENDPOINT_PROXY_HYPHENS, DEFAULT_ENDPOINTPROXY);
        }

        public Integer port() {
            return this.port;
        }

        public String endpointProxy() {
            return this.endpointProxy;
        }

    }
}
