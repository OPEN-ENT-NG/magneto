package fr.cgi.magneto.model.slides;

public class SlideText extends Slide {
    private final String text;

    public SlideText(String text) {
        this.text = text;
    }

    @Override
    public Object createApacheSlide() {
        return null; // Implémentation à venir
    }
}