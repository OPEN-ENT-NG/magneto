package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideTitle extends Slide {
    private final String title;

    public SlideTitle(String title) {
        this.title = title;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        return null;
    }
}