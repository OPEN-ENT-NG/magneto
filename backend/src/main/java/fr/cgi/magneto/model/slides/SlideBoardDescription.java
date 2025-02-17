package fr.cgi.magneto.model.slides;

public class SlideBoardDescription extends Slide {
    private final String description;

    public SlideBoardDescription(String description) {
        this.description = description;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
