package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;

public class SlideDescription extends Slide {

    public SlideDescription(String title, String description) {
        this.title = title;
        this.description = description;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {

        SlideHelper.createTitle(newSlide, title,
                Slideshow.DESCRIPTION_TITLE_HEIGHT, Slideshow.DESCRIPTION_TITLE_FONT_SIZE, TextParagraph.TextAlign.LEFT);

        XSLFTextBox textBox = SlideHelper.createContent(newSlide);

        XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
        paragraph.setTextAlign(TextParagraph.TextAlign.LEFT);
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(description);
        textRun.setFontSize(Slideshow.DESCRIPTION_FONT_SIZE);

        return newSlide;
    }
}
