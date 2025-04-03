package fr.cgi.magneto.model;

import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonObject;

public class Metadata implements Model {
    private final String name;
    private final String filename;
    private final String contentType;
    private final String contentTransferEncoding;
    private final String charset;
    private final Integer size;
    private final String extension;
    private final String fileOwner;

    public Metadata(JsonObject metadata) {
        this.name = metadata.getString(Field.NAME, null);
        this.filename = metadata.getString(Field.FILENAME, null);
        this.contentType = metadata.getString(Field.CONTENT_TYPE, null);
        this.contentTransferEncoding = metadata.getString(Field.CONTENT_TRANSFER_ENCODING, null);
        this.charset = metadata.getString(Field.CHARSET, null);
        this.size = metadata.getInteger(Field.SIZE, null);
        this.extension = filename.substring(filename.lastIndexOf('.') + 1);
        this.fileOwner = metadata.getString(Field.FILEOWNER, null);
    }

    public String getName() {
        return name;
    }

    public String getFilename() {
        return filename;
    }

    public String getContentType() {
        return contentType;
    }

    public String getContentTransferEncoding() {
        return contentTransferEncoding;
    }

    public String getCharset() {
        return charset;
    }

    public Integer getSize() {
        return size;
    }

    public String getExtension() {
        return extension;
    }

    public String getFileOwner() {
        return fileOwner;
    }


    @Override
    public JsonObject toJson() {
        return new JsonObject()
                .put(Field.NAME, this.getName())
                .put(Field.FILENAME, this.getFilename())
                .put(Field.CONTENT_TYPE, this.getContentType())
                .put(Field.CONTENT_TRANSFER_ENCODING, this.getContentTransferEncoding())
                .put(Field.CHARSET, this.getCharset())
                .put(Field.SIZE, this.getSize())
                .put(Field.EXTENSION, this.getExtension())
                .put(Field.FILEOWNER, this.getFileOwner());
    }

    @Override
    public Metadata model(JsonObject metadata) {
        return new Metadata(metadata);
    }

}
