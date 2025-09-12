package fr.cgi.magneto.realtime;

import fr.cgi.magneto.core.constants.Rights;
import fr.cgi.magneto.core.enums.RightLevel;
import fr.cgi.magneto.core.enums.UserColor;
import fr.cgi.magneto.realtime.events.CollaborationUsersMetadata;
import fr.cgi.magneto.realtime.events.UserBoardRights;
import fr.cgi.magneto.helper.WorkflowHelper;
import fr.cgi.magneto.model.user.User;
import fr.wseduc.webutils.Utils;
import io.vertx.core.Vertx;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.impl.logging.Logger;
import io.vertx.core.impl.logging.LoggerFactory;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.redis.client.RedisOptions;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.stream.Collectors;

import static fr.cgi.magneto.core.constants.Field.*;
import static fr.cgi.magneto.core.enums.RightLevel.*;
import static fr.cgi.magneto.core.enums.RightLevel.OWNER;

public class CollaborationHelper {
    private static final Logger log = LoggerFactory.getLogger(CollaborationHelper.class);

    private CollaborationHelper() {
    }

    public static Optional<String> getBoardId(String path) {
        final String[] splitted = path.split("/");
        if (splitted.length > 0) {
            return Optional.of(splitted[splitted.length - 1].trim().toLowerCase());
        }
        return Optional.empty();
    }

    public static int getConnectedUsersCountForBoard(Map<String, Map<String, ServerWebSocket>> boardIdToWSIdToWS, String boardId) {
        Map<String, ServerWebSocket> wsIdToWs = boardIdToWSIdToWS.get(boardId);
        return wsIdToWs != null ? wsIdToWs.size() : 0;
    }

    public static String getConnectionLimitsStatus(String boardId, String userId, int currentPlatformConnections,
                                          int currentBoardConnections, int maxConnections, int maxConnectionsPerBoard, double warningThreshold) {

        // Vérifier la limite globale de la plateforme
        double platformThreshold = maxConnections * warningThreshold;
        if (currentPlatformConnections >= maxConnections) {
            log.warn(String.format("[Magneto@CollaborationHelper::checkConnectionLimits] Maximum connections reached for platform (%d/%d). Rejecting connection for user %s",
                    currentPlatformConnections, maxConnections, userId));
            return "Platform capacity exceeded";
        }
        else if (currentPlatformConnections >= platformThreshold) {
            log.warn(String.format("[Magneto@CollaborationHelper::checkConnectionLimits] Platform approaching maximum capacity (%d/%d - %d%%). Connection allowed for user %s",
                    currentPlatformConnections, maxConnections,
                    Math.round((double)currentPlatformConnections / maxConnections * 100), userId));
        }

        // Vérifier la limite par tableau
        double boardThreshold = maxConnectionsPerBoard * warningThreshold;
        if (currentBoardConnections >= maxConnectionsPerBoard) {
            log.warn(String.format("[Magneto@CollaborationHelper::checkConnectionLimits] Maximum connections reached for board %s (%d/%d). Rejecting connection for user %s",
                    boardId, currentBoardConnections, maxConnectionsPerBoard, userId));
            return "Board capacity exceeded";
        }
        else if (currentBoardConnections >= boardThreshold) {
            log.warn(String.format("[Magneto@CollaborationHelper::checkConnectionLimits] Board %s approaching maximum capacity (%d/%d - %d%%). Connection allowed for user %s",
                    boardId, currentBoardConnections, maxConnectionsPerBoard,
                    Math.round((double)currentBoardConnections / maxConnectionsPerBoard * 100), userId));
        }

        return OK;
    }

    public static UserBoardRights calculateRights(JsonObject board, UserInfos user) {
        // Vérifier si owner
        boolean isOwner = user.getUserId().equals(board.getString(OWNERID));
        if (isOwner) {
            return new UserBoardRights(OWNER);
        }

        RightLevel maxRight = NONE;

        // Parcourir les partages pour trouver le droit le plus élevé
        JsonArray shared = board.getJsonArray(SHARED, new JsonArray());
        for (Object item : shared) {
            JsonObject share = (JsonObject) item;

            boolean isUserShare = user.getUserId().equals(share.getString(USERID));
            boolean isGroupShare = user.getGroupsIds().contains(share.getString(GROUPID));

            if (isUserShare || isGroupShare) {
                // Vérifier dans l'ordre décroissant pour optimiser
                if (share.getBoolean("fr-cgi-magneto-controller-ShareBoardController|initManagerRight", false)) {
                    maxRight = MANAGER;
                    break; // Pas besoin de continuer, c'est le maximum
                } else if (share.getBoolean("fr-cgi-magneto-controller-ShareBoardController|initPublishRight", false)) {
                    maxRight = PUBLISH;
                } else if (share.getBoolean("fr-cgi-magneto-controller-ShareBoardController|initContribRight", false)
                        && maxRight.getLevel() < CONTRIB.getLevel()) {
                    maxRight = CONTRIB;
                } else if (share.getBoolean("fr-cgi-magneto-controller-ShareBoardController|initReadRight", false)
                        && maxRight.getLevel() < READ.getLevel()) {
                    maxRight = READ;
                }
            }
        }

        UserBoardRights rights = new UserBoardRights(maxRight);

        // Appliquer les règles de workflow pour contrib et plus
        if (rights.hasContrib() && !WorkflowHelper.hasRight(user, Rights.MANAGE_BOARD)) {
            rights.setMaxRight(READ);
        }

        return rights;
    }

    public static UserColor assignColorToUser(String boardId, CollaborationUsersMetadata context) {
        if (context == null || context.getConnectedUsers().isEmpty()) {
            UserColor[] colors = UserColor.values();
            Random random = new Random();
            return colors[random.nextInt(colors.length)];
        }

        // Récupérer les couleurs déjà utilisées depuis le Set
        Set<UserColor> usedColors = context.getConnectedUsers().stream()
                .map(User::getColor)
                .collect(Collectors.toSet());

        // Créer une liste des couleurs disponibles
        List<UserColor> availableColors = Arrays.stream(UserColor.values())
                .filter(color -> !usedColors.contains(color))
                .collect(Collectors.toList());

        Random random = new Random();

        if (!availableColors.isEmpty()) {
            return availableColors.get(random.nextInt(availableColors.size()));
        } else {
            UserColor[] colors = UserColor.values();
            return colors[random.nextInt(colors.length)];
        }
    }

    // Redis

    public static RedisOptions getRedisOptions(Vertx vertx, JsonObject conf) {
        JsonObject redisConfig = conf.getJsonObject("redisConfig");

        if (redisConfig == null) {
            final String redisConf = (String) vertx.sharedData().getLocalMap("server").get("redisConfig");
            if (redisConf == null) {
                throw new IllegalStateException("missing.redis.config");
            } else {
                redisConfig = new JsonObject(redisConf);
            }
        }
        String redisConnectionString = redisConfig.getString("connection-string");
        if (Utils.isEmpty(redisConnectionString)) {
            redisConnectionString =
                "redis://" + (redisConfig.containsKey("auth") ? ":" + redisConfig.getString("auth") + "@" : "") +
                    redisConfig.getString("host") + ":" + redisConfig.getInteger("port") + "/" +
                    redisConfig.getInteger("select", 0);
        }
        return new RedisOptions()
            .setConnectionString(redisConnectionString)
            .setMaxPoolSize(redisConfig.getInteger("pool-size", 32))
            .setMaxWaitingHandlers(redisConfig.getInteger("maxWaitingHandlers", 100))
            .setMaxPoolWaiting(redisConfig.getInteger("maxPoolWaiting", 100));
    }

}
