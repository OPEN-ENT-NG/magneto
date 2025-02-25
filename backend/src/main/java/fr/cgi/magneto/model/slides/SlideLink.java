package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideLink extends Slide {
    private final String link;

    public SlideLink(String link) {
        this.link = link;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        return null;
    }
}
