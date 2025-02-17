package fr.cgi.magneto.model.slides;

public class SlideMedia extends Slide {
    private final String fileUrl;

    public SlideMedia(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
