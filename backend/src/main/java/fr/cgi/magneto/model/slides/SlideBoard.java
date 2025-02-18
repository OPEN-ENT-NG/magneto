package fr.cgi.magneto.model.slides;

public class SlideBoard extends Slide {
    private final String ownerName;
    private final String modificationDate;
    private final int magnetNumber;
    private final boolean isShare;
    private final boolean isPublic;

    public SlideBoard(String title, String description, String ownerName, String modificationDate, int magnetNumber,
            boolean isShare, boolean isPublic) {
        this.title = title;
        this.description = description;
        this.ownerName = ownerName;
        this.modificationDate = modificationDate;
        this.magnetNumber = magnetNumber;
        this.isShare = isShare;
        this.isPublic = isPublic;
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
