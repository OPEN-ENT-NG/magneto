package fr.cgi.magneto.model.slides;

public class SlideTitle extends Slide {
    private final String title;

    public SlideTitle(String title) {
        this.title = title;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}