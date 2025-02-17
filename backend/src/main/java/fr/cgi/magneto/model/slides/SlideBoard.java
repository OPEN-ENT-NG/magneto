package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.model.boards.Board;

public class SlideBoard extends Slide {
    private final String ownerName;
    private final String modificationDate;
    private final int magnetNumber;
    private final boolean isShare;
    private final boolean isPublic;

    public SlideBoard(Board board) {
        this.ownerName = board.getOwnerName();
        this.modificationDate = board.getModificationDate();
        this.magnetNumber = board.isLayoutFree() ? board.getNbCards() : board.getNbCardsSections();
        this.isShare = board.getShared() != null && !board.getShared().isEmpty();
        this.isPublic = board.isPublic();
    }

    @Override
    public Object createApacheSlide() {
        return null;
    }
}
