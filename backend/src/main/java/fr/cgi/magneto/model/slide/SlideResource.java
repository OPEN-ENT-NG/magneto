package fr.cgi.magneto.model.slide;

import io.vertx.core.json.JsonObject;
import java.util.Map;

import fr.cgi.magneto.core.enums.ResourceType;

public class SlideResource {
    private String id;
    private String title;
    private ResourceType type;
    private String content;
    private String resourceUrl;
    private Map<String, Object> metadata;

    // Constructeur vide nécessaire pour le mapping JSON
    public SlideResource() {
    }

    public SlideResource(String id, String title, ResourceType type, String content, String resourceUrl,
            Map<String, Object> metadata) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.content = content;
        this.resourceUrl = resourceUrl;
        this.metadata = metadata;
    }

    // Getters et Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getResourceUrl() {
        return resourceUrl;
    }

    public void setResourceUrl(String resourceUrl) {
        this.resourceUrl = resourceUrl;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public JsonObject toJson() {
        return new JsonObject()
                .put("id", this.id)
                .put("title", this.title)
                .put("type", this.type.name())
                .put("content", this.content)
                .put("resourceUrl", this.resourceUrl)
                .put("metadata", this.metadata);
    }
}