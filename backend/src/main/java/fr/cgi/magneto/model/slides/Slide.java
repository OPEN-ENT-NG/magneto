package fr.cgi.magneto.model.slides;


public abstract class Slide {
    protected String title;
    protected String description = "";

     public abstract Object createApacheSlide();
}
