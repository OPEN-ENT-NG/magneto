package fr.cgi.magneto.helper;

import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.reflections.Reflections;

import java.lang.reflect.Constructor;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import static org.reflections.scanners.Scanners.SubTypes;

@RunWith(VertxUnitRunner.class)
public class IModelHelperTest {
    enum MyEnum {
        VALUE1,
        VALUE2,
        VALUE3
    }

    static class MyClass {
        public String id;
    }
    static class MyIModel implements Model<MyIModel> {
        public String id;
        public boolean isGood;
        public MyOtherIModel otherIModel;
        public MyClass myClass;
        public List<Integer> typeIdList;
        public List<MyOtherIModel> otherIModelList;
        public List<MyClass> myClassList;
        public List<List<JsonObject>> listList;
        public MyEnum myEnum;
        public List<MyEnum> myEnumList;
        public MyEnum nullValue = null;

        @Override
        public JsonObject toJson() {
            return null;
        }

        @Override
        public MyIModel model(JsonObject model) {
            return null;
        }
    }

    static class MyOtherIModel implements Model<MyOtherIModel> {
        public String myName;

        public MyOtherIModel() {
        }

        public MyOtherIModel(JsonObject jsonObject) {
            this.myName = jsonObject.getString("my_name");
        }

        @Override
        public JsonObject toJson() {
            return null;
        }

        @Override
        public MyOtherIModel model(JsonObject model) {
            return null;
        }
    }

    private static final Logger log = LoggerFactory.getLogger(IModelHelperTest.class);

    @Test
    public void testSubClassIModel(TestContext ctx) {
        Reflections reflections = new Reflections("fr.cgi.magneto");
        List<Class<?>> ignoredClassList = Arrays.asList(MyIModel.class, MyOtherIModel.class);

        Set<Class<?>> subTypes =
                reflections.get(SubTypes.of(Model.class).asClass());
        List<Class<?>> invalidModel = subTypes.stream()
                .filter(modelClass -> !ignoredClassList.contains(modelClass))
                .filter(modelClass -> {
                    Constructor<?> emptyConstructor = Arrays.stream(modelClass.getConstructors())
                            .filter(constructor -> constructor.getParameterTypes().length == 1
                                    && constructor.getParameterTypes()[0].equals(JsonObject.class))
                            .findFirst()
                            .orElse(null);
                    return emptyConstructor == null;
                }).collect(Collectors.toList());

        invalidModel.forEach(modelClass -> {
            String message = String.format("[Magneto@%s::testSubClassIModel]: The class %s must have public constructor with JsonObject parameter declared",
                    this.getClass().getSimpleName(), modelClass.getSimpleName());
            log.fatal(message);
        });

        ctx.assertTrue(invalidModel.isEmpty(), "One or more IModel don't have public constructor with JsonObject parameter declared. Check log above.");
    }
}
