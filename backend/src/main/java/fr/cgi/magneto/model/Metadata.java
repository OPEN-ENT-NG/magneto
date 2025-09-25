package fr.cgi.magneto.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import fr.cgi.magneto.core.constants.Field;
import io.vertx.core.json.JsonObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Metadata implements Model {

    @JsonProperty("name")
    private final String name;

    @JsonProperty("filename")
    private final String filename;

    @JsonProperty("contentType")
    private final String contentType;

    @JsonProperty("contentTransferEncoding")
    private final String contentTransferEncoding;

    @JsonProperty("charset")
    private final String charset;

    @JsonProperty("size")
    private final Integer size;

    @JsonProperty("extension")
    private final String extension;

    @JsonProperty("fileOwner")
    private final String fileOwner;

    public Metadata() {
        this.name = null;
        this.filename = null;
        this.contentType = null;
        this.contentTransferEncoding = null;
        this.charset = null;
        this.size = null;
        this.extension = null;
        this.fileOwner = null;
    }

    @JsonCreator
    public Metadata(@JsonProperty("name") String name,
                    @JsonProperty("filename") String filename,
                    @JsonProperty("contentType") String contentType,
                    @JsonProperty("contentTransferEncoding") String contentTransferEncoding,
                    @JsonProperty("charset") String charset,
                    @JsonProperty("size") Integer size,
                    @JsonProperty("extension") String extension,
                    @JsonProperty("fileOwner") String fileOwner) {
        this.name = name;
        this.filename = filename;
        this.contentType = contentType;
        this.contentTransferEncoding = contentTransferEncoding;
        this.charset = charset;
        this.size = size;
        this.extension = extension;
        this.fileOwner = fileOwner;
    }

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
