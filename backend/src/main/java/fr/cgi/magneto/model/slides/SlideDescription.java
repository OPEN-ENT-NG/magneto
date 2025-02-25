package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideDescription extends Slide {

    public SlideDescription(String description) {
        this.description = description;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        return null;
    }
}
