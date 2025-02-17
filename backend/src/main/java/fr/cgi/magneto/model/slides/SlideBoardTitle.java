package fr.cgi.magneto.model.slides;

public class SlideBoardTitle extends Slide {
    private final String title;

    public SlideBoardTitle(String title) {
        this.title = title;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}