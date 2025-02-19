package fr.cgi.magneto.factory;

import fr.cgi.magneto.core.enums.SlideResourceType;
import fr.cgi.magneto.model.slides.*;
import fr.cgi.magneto.model.properties.SlideProperties;

public class SlideFactory {

    public Slide createSlide(SlideResourceType type, SlideProperties properties) {
        if (!properties.isValidForType(type)) {
            throw new IllegalArgumentException("Invalid properties for slide type: " + type);
        }

        switch (type) {
            case TEXT:
                return new SlideText(properties.getTitle(), properties.getDescription());
            case FILE:
            case PDF:
                return new SlideFile(properties.getUrl(), properties.getFileName());
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                return new SlideLink(properties.getUrl());
            case IMAGE:
            case VIDEO:
            case AUDIO:
                return new SlideMedia(properties.getUrl(), properties.getFileName());
            case BOARD:
                return new SlideBoard(
                        properties.getTitle(), properties.getDescription(),
                        properties.getOwnerName(),
                        properties.getModificationDate(),
                        properties.getResourceNumber(),
                        properties.getIsShare(),
                        properties.getIsPublic());
            default:
                throw new IllegalArgumentException("Unsupported slide type: " + type);
        }
    }
}