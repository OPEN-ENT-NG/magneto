package fr.cgi.magneto.helper;
import fr.cgi.magneto.core.constants.Field;
import fr.wseduc.webutils.Either;
import io.vertx.core.*;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import java.util.List;

public class FutureHelper {

    private static final Logger LOGGER = LoggerFactory.getLogger(FutureHelper.class);

    private FutureHelper() {
    }

    public static <L, R> Handler<Either<L, R>> handlerEitherPromise(Promise<R> promise) {
        return event -> {
            if (event.isRight()) {
                promise.complete(event.right().getValue());
            } else {
                String message = String.format("[Magneto@FutureHelper::handlerEitherPromise]: %s", event.left().getValue());
                LOGGER.error(message);
                promise.fail(event.left().getValue().toString());
            }
        };
    }

    public static Handler<Either<String, JsonArray>> handlerJsonArray(Handler<AsyncResult<JsonArray>> handler) {
        return event -> {
            if (event.isRight()) {
                handler.handle(Future.succeededFuture(event.right().getValue()));
            } else {
                LOGGER.error(event.left().getValue());
                handler.handle(Future.failedFuture(event.left().getValue()));
            }
        };
    }

    public static Handler<AsyncResult<JsonArray>> handlerAsyncJsonArray(Promise<JsonArray> promise) {
        return event -> {
            if (event.succeeded()) {
                promise.complete(event.result());
            } else {
                LOGGER.error(event.cause().getMessage());
                promise.fail(event.cause().getMessage());
            }
        };
    }

    public static Handler<Either<String, JsonObject>> handlerJsonObject(Handler<AsyncResult<JsonObject>> handler) {
        return event -> {
            if (event.isRight()) {
                handler.handle(Future.succeededFuture(event.right().getValue()));
            } else {
                LOGGER.error(event.left().getValue());
                handler.handle(Future.failedFuture(event.left().getValue()));
            }
        };
    }

    public static void busArrayHandler(Future<JsonArray> future, Message<JsonObject> message) {
        future
                .onSuccess(result -> message.reply((new JsonObject()).put(Field.STATUS, Field.OK).put(Field.RESULT, result)))
                .onFailure(error -> message.reply((new JsonObject()).put(Field.STATUS, Field.ERROR).put(Field.MESSAGE, error.getMessage())));
    }

    public static void busObjectHandler(Future<JsonObject> future, Message<JsonObject> message) {
        future
                .onSuccess(result -> message.reply((new JsonObject()).put(Field.STATUS, Field.OK).put(Field.RESULT, result)))
                .onFailure(error -> message.reply((new JsonObject()).put(Field.STATUS, Field.ERROR).put(Field.MESSAGE, error.getMessage())));
    }

    public static void handleObjectResult(JsonObject messageBody, Promise<JsonObject> promise) {
        if (Field.OK.equals(messageBody.getString(Field.STATUS)))
            promise.complete(messageBody.getJsonObject(Field.RESULT, new JsonObject()));
        else {
            LOGGER.error(messageBody.getString(Field.MESSAGE));
            promise.fail(messageBody.getString(Field.MESSAGE));
        }
    }

    public static <T> CompositeFuture all(List<Future<T>> futures) {
        return Future.all(futures);
    }

    public static <T> CompositeFuture join(List<Future<T>> futures) {
        return Future.join(futures);
    }

}