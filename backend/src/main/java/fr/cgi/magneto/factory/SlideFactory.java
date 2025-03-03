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
                        properties.getModificationDate(), properties.getResourceData(), properties.getContentType());
            case DESCRIPTION:
                return new SlideDescription(properties.getTitle(), properties.getDescription());
            case TEXT:
                return new SlideText(properties.getTitle(), properties.getDescription());
            case FILE:
            case PDF:
                return new SlideFile(properties.getTitle(), properties.getDescription(), properties.getFileNameString(), properties.getCaption(), properties.getResourceData(), properties.getContentType());
            case LINK:
            case HYPERLINK:
            case EMBEDDER:
                return new SlideLink(properties.getTitle(), properties.getDescription(), properties.getResourceUrl(), properties.getCaption(), properties.getResourceData(), properties.getContentType());
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
                        properties.getIsPublic(),
                        properties.getCaption(),
                        properties.getLink(),
                        properties.getContentType(), properties.getResourceData(), properties.getI18ns());

            default:
                throw new IllegalArgumentException("Unsupported slide type: " + type);
        }
    }
}