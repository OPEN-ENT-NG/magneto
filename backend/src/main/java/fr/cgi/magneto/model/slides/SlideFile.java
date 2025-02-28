package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XSLFSlide;

public class SlideFile extends Slide {
    private final String filenameString;
    private final String caption;
    private final byte[] fileSvg;

    public SlideFile(String filenameString, String caption, byte[] fileSvg) {
        this.filenameString = filenameString;
        this.caption = caption;
        this.fileSvg = fileSvg;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        return null;
    }
}
