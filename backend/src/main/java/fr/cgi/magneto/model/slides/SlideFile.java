package fr.cgi.magneto.model.slides;

public class SlideFile extends Slide {
    private final String fileName;
    private final String desc;

    public SlideFile(String fileName, String desc) {
        this.fileName = fileName;
        this.desc = desc;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
