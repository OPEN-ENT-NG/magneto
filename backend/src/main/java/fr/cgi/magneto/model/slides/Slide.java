package fr.cgi.magneto.model.slides;

import org.apache.poi.xslf.usermodel.XSLFSlide;

public abstract class Slide {
    protected String title;
    protected String description = "";

     public abstract Object createApacheSlide(XSLFSlide newSlide);
}
