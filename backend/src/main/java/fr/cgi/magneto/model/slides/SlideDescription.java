package fr.cgi.magneto.model.slides;

public class SlideDescription extends Slide {

    public SlideDescription(String description) {
        this.description = description;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
