package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideMedia extends Slide {

    private byte[] resourceData;
    private final String fileExtension;
    private final String caption;

    public SlideMedia(String title, String caption, byte[] resourceData,
            String fileExtension) {
        this.title = title;
        this.caption = caption;
        this.resourceData = resourceData;
        this.fileExtension = fileExtension;
    }

    @Override
    public Object createApacheSlide() {

        XMLSlideShow ppt = new XMLSlideShow();
        XSLFSlide slide = ppt.createSlide();

        SlideHelper.createTitle(slide, title, Slideshow.TITLE_HEIGHT, Slideshow.TITLE_FONT_SIZE, TextParagraph.TextAlign.LEFT);
        SlideHelper.createImage(slide, resourceData, fileExtension, Slideshow.CONTENT_MARGIN_TOP, Slideshow.IMAGE_CONTENT_HEIGHT);
        SlideHelper.createLegend(slide, caption);

        return slide;
    }
}