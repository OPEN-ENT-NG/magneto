package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import fr.cgi.magneto.helper.SlideHelper;


public class SlideMedia extends Slide {

    private byte[] resourceData;
    private final String fileExtension;

    public SlideMedia(String title, String description, byte[] resourceData,
            String fileExtension) {
        this.title = title;
        this.description = description;
        this.resourceData = resourceData;
        this.fileExtension = fileExtension;
    }

    @Override
    public Object createApacheSlide() {

        XMLSlideShow ppt = new XMLSlideShow();
        XSLFSlide slide = ppt.createSlide();

        SlideHelper.createTitle(slide, title);
        SlideHelper.createImage(slide, resourceData, fileExtension);
        SlideHelper.createLegend(slide, description);

        return slide;
    }
}