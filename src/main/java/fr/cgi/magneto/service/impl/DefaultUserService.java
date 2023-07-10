package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.model.user.User;
import fr.cgi.magneto.service.UserService;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import org.entcore.common.neo4j.Neo4j;
import org.entcore.common.neo4j.Neo4jResult;

import java.util.List;

public class DefaultUserService implements UserService {
    private static final Logger log = LoggerFactory.getLogger(DefaultUserService.class);


    public Future<JsonArray> getUsersByIds(List<String> userIds) {
        Promise<JsonArray> promise = Promise.promise();

        String query = "MATCH (s:Structure)<-[:DEPENDS]-(:ProfileGroup)<-[:IN]-(u:User) " +
                "WHERE u.id IN {userIds} " +
                "RETURN distinct u.id as id, u.profiles as profiles, s.UAI as uai";

        JsonObject params = new JsonObject()
                .put(Field.USERIDS, userIds);

        Neo4j.getInstance().execute(query, params, Neo4jResult.validResultHandler(stringJsonArrayEither -> {
            if (stringJsonArrayEither.isRight()) {
                promise.complete(stringJsonArrayEither.right().getValue());
            } else {
                log.error(String.format("[Magneto@%s::getUsersByIds] Fail to get users by ids %s",
                        this.getClass().getSimpleName(), stringJsonArrayEither.left().getValue()));
                promise.fail(stringJsonArrayEither.left().getValue());
            }
        }));

        return promise.future();
    }
}
