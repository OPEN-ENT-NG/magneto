package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.service.ShareBookMarkService;
import fr.wseduc.webutils.Either;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import org.entcore.common.neo4j.Neo4j;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;

import static org.entcore.common.neo4j.Neo4jResult.validUniqueResultHandler;


public class DefaultShareBookMarkService implements ShareBookMarkService {
    private Neo4j neo4j;
    private static final Logger log = LoggerFactory.getLogger(DefaultShareBookMarkService.class);

    public DefaultShareBookMarkService(Neo4j neo4j) {
        this.neo4j = neo4j;
    }

    @Override
    public Future<JsonObject> get(String userId, String id) {
        Promise<JsonObject> promise = Promise.promise();
        final String query =
                "MATCH (:User {id:{userId}})-[:HAS_SB]->(sb:ShareBookmark) " +
                        "UNWIND TAIL(sb." + id + ") as vid " +
                        "MATCH (v:Visible {id : vid}) " +
                        "WHERE not(has(v.deleteDate)) " +
                        "RETURN \"" + id + "\" as id, HEAD(sb." + id + ") as name, " +
                        "COLLECT(DISTINCT {id : v.id, name : v.name, displayName :  v.displayName, groupType : labels(v), " +
                        "groupProfile : v.filter, nbUsers : v.nbUsers, profile : HEAD(v.profiles), activationCode : has(v.activationCode) }) as members;";
        JsonObject params = new JsonObject();
        params.put("userId", userId);
        neo4j.execute(query, params, validUniqueResultHandler(event -> {
            if(event.isRight()){
                promise.complete(event.right().getValue());
            }else {
                promise.fail(event.left().getValue());
            }
        }));
        return promise.future();
    }
}