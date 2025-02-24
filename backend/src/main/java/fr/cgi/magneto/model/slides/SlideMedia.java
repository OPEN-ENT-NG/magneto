package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import fr.cgi.magneto.helper.SlideHelper;

public class SlideMedia extends Slide {

    public enum MediaType {
        IMAGE,
        AUDIO,
        VIDEO
    }

    private byte[] resourceData;
    private final String fileExtension;
    private final String caption;
    private final MediaType mediaType;

    public SlideMedia(String title, String caption, byte[] resourceData,
            String fileExtension) {
        this.title = title;
        this.caption = caption;
        this.resourceData = resourceData;
        this.fileExtension = fileExtension;
        this.mediaType = determineMediaType(fileExtension);

        // Log des informations dans le constructeur
        System.out.println("SlideMedia - Construction:");
        System.out.println("Title: " + title);
        System.out.println("Caption: " + caption);
        System.out.println("File extension: " + fileExtension);
        System.out.println(
                "Resource data present: " + (resourceData != null ? "Yes (" + resourceData.length + " bytes)" : "No"));
        System.out.println("Determined media type: " + mediaType);
    }

    private MediaType determineMediaType(String extension) {
        String ext = extension.toLowerCase();
        MediaType type;
        if (ext.matches("^[.]?(mp3|wav|ogg|m4a)$")) {
            type = MediaType.AUDIO;
        } else if (ext.matches("^[.]?(mp4|avi|mov|wmv)$")) {
            type = MediaType.VIDEO;
        } else {
            type = MediaType.IMAGE;
        }
     
        // Log du type de média déterminé  
        System.out.println("determineMediaType - Extension: " + extension + " -> Type: " + type);
     
        return type;
     }

    @Override
    public Object createApacheSlide() {
        // Log au début de la création de la slide
        System.out.println("\nStarting createApacheSlide:");
        System.out.println("Title: " + title);
        System.out.println("Media type: " + mediaType);
        System.out.println("Resource data size: " + (resourceData != null ? resourceData.length : "null") + " bytes");
        System.out.println("File extension: " + fileExtension);

        XMLSlideShow ppt = new XMLSlideShow();
        XSLFSlide slide = ppt.createSlide();

        SlideHelper.createTitle(slide, title);
        switch (mediaType) {
            case AUDIO:
                System.out.println("Creating audio slide...");
                SlideHelper.createAudio(slide, resourceData, fileExtension);
                break;
            default:
                System.out.println("Creating image slide...");
                SlideHelper.createImage(slide, resourceData, fileExtension);
        }
        SlideHelper.createLegend(slide, caption);

        System.out.println("Slide creation completed.");
        return slide;
    }
}