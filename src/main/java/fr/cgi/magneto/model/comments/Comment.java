package fr.cgi.magneto.model.comments;

import fr.cgi.magneto.core.constants.*;
import fr.cgi.magneto.helper.*;
import fr.cgi.magneto.model.*;
import io.vertx.core.json.JsonObject;

import java.util.*;

public class Comment implements Model<Comment> {
    private String _id;
    private String ownerId;
    private String ownerName;
    private String modificationDate;
    private String creationDate;
    private String content;

    public Comment(JsonObject comment) {
        this._id = comment.getString(Field._ID, null);
        this.ownerId = comment.getString(Field.OWNERID);
        this.ownerName = comment.getString(Field.OWNERNAME);
        this.content = comment.getString(Field.CONTENT);
        this.creationDate = comment.getString(Field.CREATIONDATE);
        this.modificationDate = comment.getString(Field.MODIFICATIONDATE, null);

        if (this.getId() == null) {
            this.setCreationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }

        if (this.getModificationDate() == null) {
            this.setModificationDate(DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT));
        }
    }

    public String getId() {
        return _id;
    }

    public Comment setId(String id) {
        this._id = id;
        return this;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public Comment setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public Comment setOwnerName(String ownerName) {
        this.ownerName = ownerName;
        return this;
    }

    public String getModificationDate() {
        return modificationDate;
    }

    public Comment setModificationDate(String modificationDate) {
        this.modificationDate = modificationDate;
        return this;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public Comment setCreationDate(String creationDate) {
        this.creationDate = creationDate;
        return this;
    }

    public String getContent() {
        return content;
    }

    public Comment setContent(String content) {
        this.content = content;
        return this;
    }

    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field._ID, this.getId())
                .put(Field.OWNERID, this.getOwnerId())
                .put(Field.OWNERNAME, this.getOwnerName())
                .put(Field.MODIFICATIONDATE, this.getModificationDate())
                .put(Field.CREATIONDATE, this.getCreationDate())
                .put(Field.CONTENT, this.getContent());
    }

    @Override
    public Comment model(JsonObject json) {
        return new Comment(json);
    }
}
