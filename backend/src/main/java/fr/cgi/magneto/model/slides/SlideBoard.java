package fr.cgi.magneto.model.slides;

import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XSLFSlide;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import io.vertx.core.json.JsonObject;

public class SlideBoard extends Slide {
    private final String ownerName;
    private final String link;
    private final String modificationDate;
    private final int resourceNumber;
    private final boolean isShare;
    private final boolean isPublic;
    private final String caption;
    private final String fileContentType;
    private byte[] resourceData;
    private JsonObject i18ns;

    public SlideBoard(String title, String description, String ownerName, String modificationDate, int resourceNumber,
            boolean isShare, boolean isPublic, String caption, String link, String contentType,
            byte[] resourceData, JsonObject i18ns) {
        this.title = title;
        this.description = description;
        this.ownerName = ownerName;
        this.modificationDate = modificationDate;
        this.resourceNumber = resourceNumber;
        this.caption = caption;
        this.isShare = isShare;
        this.isPublic = isPublic;
        this.link = link;
        this.fileContentType = contentType;
        this.resourceData = resourceData;
        this.i18ns = i18ns;

    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        SlideHelper.createTitle(newSlide, title, Slideshow.TITLE_HEIGHT, Slideshow.TITLE_FONT_SIZE,
                TextParagraph.TextAlign.LEFT);
        SlideHelper.createLink(newSlide, link);
        SlideHelper.createImage(newSlide, resourceData, fileContentType, Slideshow.MAIN_CONTENT_MARGIN_TOP,
                Slideshow.BOARD_IMAGE_CONTENT_HEIGHT, true);
        SlideHelper.createBoardInfoList(newSlide, ownerName, modificationDate, resourceNumber, isShare, isPublic,
                i18ns);
        SlideHelper.createLegend(newSlide, caption);

        return newSlide;
    }
}
