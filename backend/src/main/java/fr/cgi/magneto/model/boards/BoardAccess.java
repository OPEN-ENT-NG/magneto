package fr.cgi.magneto.model.boards;

import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.DateHelper;
import io.vertx.core.json.JsonObject;

import java.util.Date;

public class BoardAccess {
    private String boardId;
    private String userId;
    private String creationDate;

    public BoardAccess() {
        this.creationDate = DateHelper.getDateString(new Date(), DateHelper.MONGO_FORMAT);
    }

    public String getBoardId() {
        return boardId;
    }

    public void setBoardId(String boardId) {
        this.boardId = boardId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(String creationDate) {
        this.creationDate = creationDate;
    }

    public JsonObject toJson(){
        return  new JsonObject().put(Field.BOARDID, this.boardId).put(Field.USERID, this.userId).put(Field.CREATIONDATE,this.creationDate);
    }
}
