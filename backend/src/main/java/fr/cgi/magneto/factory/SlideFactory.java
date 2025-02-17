package fr.cgi.magneto.factory;

import fr.cgi.magneto.model.boards.Board;
import fr.cgi.magneto.model.cards.Card;
import fr.cgi.magneto.model.slides.*;

public class SlideFactory {
    public Slide createSlide(Card card, Board board) {
        if (card.getResourceType() == null) {
            return new SlideText(card.getTitle());
        }
    }
}
