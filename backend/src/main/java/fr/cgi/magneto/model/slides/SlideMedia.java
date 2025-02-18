package fr.cgi.magneto.model.slides;

public class SlideMedia extends Slide {
    private final String fileUrl;
    private final String fileName;

    public SlideMedia(String fileUrl, String fileName) {
        this.fileUrl = fileUrl;
        this.fileName = fileName;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
