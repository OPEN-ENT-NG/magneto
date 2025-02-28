package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideLink extends Slide {
    private final String link;
    private final String caption;
    private final byte[] resourceData;
    private final String fileContentType;

    public SlideLink(String title, String description, String link, String caption, byte[] resourceData, String fileContentType) {
        this.title = title;
        this.description = description;
        this.link = link;
        this.caption = caption;
        this.resourceData = resourceData;
        this.fileContentType = fileContentType;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {

        SlideHelper.createTitle(newSlide, title, Slideshow.TITLE_HEIGHT, Slideshow.TITLE_FONT_SIZE,
                TextParagraph.TextAlign.LEFT);
        SlideHelper.createLink(newSlide, link);
        SlideHelper.createImageWidthHeight(newSlide, resourceData, fileContentType, Slideshow.MAIN_CONTENT_MARGIN_TOP,
                Slideshow.SVG_CONTENT_HEIGHT, Slideshow.SVG_CONTENT_WIDTH, true);
        SlideHelper.createLegend(newSlide, caption);

        return newSlide;
    }
}
