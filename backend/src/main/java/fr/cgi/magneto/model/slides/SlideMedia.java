package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideMedia extends Slide {

    public enum MediaType {
        IMAGE,
        AUDIO,
        VIDEO
    }

    private byte[] resourceData;
    private final String fileContentType;
    private final String caption;
    private final MediaType mediaType;

    public SlideMedia(String title, String caption, byte[] resourceData,
            String fileContentType, String description) {
        this.title = title;
        this.caption = caption;
        this.resourceData = resourceData;
        this.fileContentType = fileContentType;
        this.mediaType = determineMediaType(fileContentType);
        this.description = description;
    }

    private MediaType determineMediaType(String contentType) {
        String type = contentType.toLowerCase();
        MediaType mediaType;

        if (type.startsWith(Slideshow.CONTENT_TYPE_AUDIO)) {
            mediaType = MediaType.AUDIO;
        } else if (type.startsWith(Slideshow.CONTENT_TYPE_VIDEO)) {
            mediaType = MediaType.VIDEO;
        } else {
            mediaType = MediaType.IMAGE;
        }
        return mediaType;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {

        SlideHelper.createTitle(newSlide, title, Slideshow.TITLE_HEIGHT, Slideshow.TITLE_FONT_SIZE,
                TextParagraph.TextAlign.LEFT);
        switch (mediaType) {
            case AUDIO:
                SlideHelper.createMedia(newSlide, resourceData, fileContentType, SlideMedia.MediaType.AUDIO);
                break;
            case VIDEO:
                SlideHelper.createMedia(newSlide, resourceData, fileContentType, SlideMedia.MediaType.VIDEO);
                break;
            default:
                SlideHelper.createImage(newSlide, resourceData, fileContentType, Slideshow.CONTENT_MARGIN_TOP,
                        Slideshow.IMAGE_CONTENT_HEIGHT, false, Slideshow.WIDTH);
        }
        SlideHelper.createLegend(newSlide, caption);

        SlideHelper.addNotes(newSlide, description);

        return newSlide;
    }
}