package fr.cgi.magneto.factory;

import fr.cgi.magneto.core.enums.SlideResourceType;
import fr.cgi.magneto.model.properties.SlideProperties;
import fr.cgi.magneto.model.slides.*;

public class SlideFactory {

    public Slide createSlide(SlideResourceType type, SlideProperties properties) {
        if (!properties.isValidForType(type)) {
            throw new IllegalArgumentException("Invalid properties for slide type: " + type);
        }

        switch (type) {
            case TITLE:
                return new SlideTitle(properties.getTitle(), properties.getDescription(), properties.getOwnerName(),
                        properties.getModificationDate(), properties.getResourceData(), properties.getContentType(),
                        properties.getI18nHelper());
            case TEXT:
                return new SlideText(properties.getTitle(), properties.getDescription());
            case FILE:
            case PDF:
                return new SlideFile(properties.getResourceUrl(), properties.getFileName());
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                return new SlideLink(properties.getResourceUrl());
            case IMAGE:
            case VIDEO:
            case AUDIO:
                return new SlideMedia(properties.getTitle(), properties.getCaption(),
                        properties.getResourceData(), properties.getContentType());
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