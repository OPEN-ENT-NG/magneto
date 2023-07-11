package fr.cgi.magneto.helper;
import fr.cgi.magneto.core.constants.Field;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.json.JsonObject;
import org.entcore.common.folders.impl.DocumentHelper;
import java.util.Date;
public class ImportExportHelper {


    public static JsonObject setModifiedMagneto(JsonObject doc, Date date)
    {
        try
        {
            // Check that the dates are in string format
            String m = doc.getString(Field.MODIFICATIONDATE);
            String c = doc.getString(Field.CREATIONDATE);

            //If we get there, the dates should be strings
            String now = DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT);

            if(m != null)
                doc.put(Field.MODIFICATIONDATE, now);

            if(c != null)
                doc.put(Field.CREATIONDATE, now);
        }
        catch(Exception e)
        {
            JsonObject now = MongoDb.now();
            doc.put(Field.MODIFICATIONDATE, now);
            if(doc.getJsonObject(Field.CREATIONDATE) != null)
                doc.put(Field.CREATIONDATE, now);
        }
        return doc;
    }

    public static JsonObject setModifiedUser(JsonObject document, String userId, String userName)
    {
        if(document.getString(Field.OWNERID) != null){
            document.put(Field.OWNERID, userId);
        }
        if (document.getString(Field.OWNERNAME) != null){
            document.put(Field.OWNERNAME, userName);
        }
        return document;
    }

    public static JsonObject removeShared(JsonObject document)
    {
        document.remove(Field.SHARED);
        return document;
    }


    public static JsonObject revertExportChanges(JsonObject document, String importPrefix, String userId, String userName){
        String title = DocumentHelper.getTitle(document);

        if (title != null && title.startsWith(importPrefix)) {
            // Remove the prefix (+1 for the separator "_")
            DocumentHelper.setTitle(document, title.substring(importPrefix.length() + 1));
        }
        DocumentHelper.clearComments(document);
        removeShared(document);
        setModifiedMagneto(document, (Date) null);
        setModifiedUser(document, userId, userName);
        return document;
    }

    public static JsonObject createErrorRapport(String collection, int ressourceNumber) {
        return new JsonObject()
                .put(Field.RAPPORT, new JsonObject()
                        .put(Field.RESSOURCE_NUMBER, Integer.toString(0))
                        .put(Field.DUPLICATES_NUMBER, Integer.toString(0))
                        .put(Field.ERRORS_NUMBER, Integer.toString(ressourceNumber)))
                .put(Field.COLLECTION, collection)
                .put(Field.IDS_MAP, new JsonObject());
    }

    public static JsonObject createEmptyRapport(String collection) {
        return new JsonObject()
                .put(Field.RAPPORT,
                        new JsonObject()
                                .put(Field.RESSOURCE_NUMBER, Integer.toString(0))
                                .put(Field.DUPLICATES_NUMBER, Integer.toString(0))
                                .put(Field.ERRORS_NUMBER, Integer.toString(0))
                )
                .put(Field.COLLECTION, collection)
                .put(Field.IDS_MAP, new JsonObject());
    }

    public static JsonObject createRapport(String collection, int ressourceNumber, int nbDuplicates, int nbErrors) {
        return new JsonObject()
                .put(Field.RAPPORT,
                        new JsonObject()
                                .put(Field.RESSOURCE_NUMBER, Integer.toString(ressourceNumber -nbErrors))
                                .put(Field.DUPLICATES_NUMBER, Integer.toString(nbDuplicates))
                                .put(Field.ERRORS_NUMBER, Integer.toString(nbErrors)))
                .put(Field.COLLECTION, collection)
                .put(Field.IDS_MAP, new JsonObject());
    }
}