package fr.cgi.magneto.model.statistics;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import fr.cgi.magneto.helper.JsonHelper;
import fr.cgi.magneto.helper.ModelHelper;
import fr.cgi.magneto.model.Model;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.Date;
import java.util.List;

public class StatisticsPayload implements Model<StatisticsPayload> {

    private String date;

    public StatisticsPayload(JsonObject statistics) {
        this.date = statistics.getString(Field.DATE, null);}

    public String getDate() {
        return date;
    }

    public StatisticsPayload setDate(String date) {
        this.date = date;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.DATE, getDate());
    }

    @Override
    public StatisticsPayload model(JsonObject statistics) {
        return new StatisticsPayload(statistics);
    }

}
