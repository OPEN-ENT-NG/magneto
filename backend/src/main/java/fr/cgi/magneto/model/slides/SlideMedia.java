package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
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
            String fileContentType) {
        this.title = title;
        this.caption = caption;
        this.resourceData = resourceData;
        this.fileContentType = fileContentType;
        this.mediaType = determineMediaType(fileContentType);

        // Log des informations dans le constructeur
        System.out.println("SlideMedia - Construction:");
        System.out.println("Title: " + title);
        System.out.println("Caption: " + caption);
        System.out.println("File extension: " + fileContentType);
        System.out.println(
                "Resource data present: " + (resourceData != null ? "Yes (" + resourceData.length + " bytes)" : "No"));
        System.out.println("Determined media type: " + mediaType);
    }

    private MediaType determineMediaType(String contentType) {
        String type = contentType.toLowerCase();
        MediaType mediaType;

        if (type.startsWith("audio/")) {
            mediaType = MediaType.AUDIO;
        } else if (type.startsWith("video/")) {
            mediaType = MediaType.VIDEO;
        } else {
            mediaType = MediaType.IMAGE;
        }

        // Log du type de média déterminé
        System.out.println("determineMediaType - Content Type: " + contentType + " -> Type: " + mediaType);

        return mediaType;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        // Log au début de la création de la slide
        System.out.println("\nStarting createApacheSlide:");
        System.out.println("Title: " + title);
        System.out.println("Media type: " + mediaType);
        System.out.println("Resource data size: " + (resourceData != null ? resourceData.length : "null") + " bytes");
        System.out.println("File extension: " + fileContentType);

        SlideHelper.createTitle(newSlide, title, Slideshow.TITLE_HEIGHT, Slideshow.TITLE_FONT_SIZE,
                TextParagraph.TextAlign.LEFT);
        switch (mediaType) {
            case AUDIO:
                System.out.println("Creating audio slide...");
                SlideHelper.createAudio(newSlide, resourceData, fileContentType);
                break;
            case VIDEO:
                System.out.println("Creating video slide...");
                SlideHelper.createVideo(newSlide, resourceData, fileContentType);
                break;
            default:
                System.out.println("Creating image slide...");
                SlideHelper.createImage(newSlide, resourceData, fileContentType, Slideshow.CONTENT_MARGIN_TOP,
                        Slideshow.IMAGE_CONTENT_HEIGHT);
        }
        SlideHelper.createLegend(newSlide, caption);

        System.out.println("Slide creation completed.");
        return newSlide;
    }
}