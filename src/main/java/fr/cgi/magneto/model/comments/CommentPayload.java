package fr.cgi.magneto.model.comments;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.*;
import io.vertx.core.json.*;
import org.entcore.common.user.*;

import java.util.*;

public class CommentPayload implements Model<CommentPayload> {

    private String id;
    private String ownerId;

    private String ownerName;

    private String modificationDate;

    private String creationDate;

    private String content;

    public CommentPayload(JsonObject comment) {
        this.id = comment.getString(Field.ID, null);
        this.ownerId = comment.getString(Field.OWNERID);
        this.ownerName = comment.getString(Field.OWNERNAME);
        this.content = comment.getString(Field.CONTENT);

        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }

        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
    }

    public CommentPayload(UserInfos user, String id, String content) {
        this.id = id;
        this.ownerId = user.getUserId();
        this.ownerName = user.getUsername();
        this.content = content;
        this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
    }

    public String getId() {
        return id;
    }

    public CommentPayload setId(String id) {
        this.id = id;
        return this;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public CommentPayload setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public CommentPayload setOwnerName(String ownerName) {
        this.ownerName = ownerName;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public CommentPayload setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public CommentPayload setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getContent() {
        return content;
    }

    public CommentPayload setContent(String content) {
        this.content = content;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field._ID, id)
                .put(Field.OWNERID, ownerId)
                .put(Field.OWNERNAME, ownerName)
                .put(Field.MODIFICATIONDATE, modificationDate)
                .put(Field.CREATIONDATE, creationDate)
                .put(Field.CONTENT, content);
    }

    @Override
    public CommentPayload model(JsonObject comment) {
        return new CommentPayload(comment);
    }

}
