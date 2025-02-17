package fr.cgi.magneto.model.slides;

public class SlideLink extends Slide {
    private final String link;

    public SlideLink(String link) {
        this.link = link;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
