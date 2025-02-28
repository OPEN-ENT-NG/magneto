package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;

public class SlideTitle extends Slide {
    private final String title;
    private final String description;
    private final String ownerName;
    private final String modificationDate;
    private final byte[] resourceData;
    private final String contentType;

    public SlideTitle(String title, String description, String ownerName, String modificationDate, byte[] resourceData,
                      String contentType) {
        this.title = title;
        this.description = description;
        this.ownerName = ownerName;
        this.modificationDate = modificationDate;
        this.resourceData = resourceData;
        this.contentType = contentType;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        // TITRE
        SlideHelper.createTitle(newSlide, title, Slideshow.MAIN_TITLE_HEIGHT,
                Slideshow.MAIN_TITLE_FONT_SIZE, TextParagraph.TextAlign.CENTER);

        XSLFTextBox textBox = SlideHelper.createContent(newSlide);

        XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
        paragraph.setTextAlign(TextParagraph.TextAlign.CENTER);
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(ownerName);
        textRun.setFontSize(Slideshow.CONTENT_FONT_SIZE);

        XSLFTextParagraph paragraph2 = textBox.addNewTextParagraph();
        paragraph2.setTextAlign(TextParagraph.TextAlign.CENTER);
        XSLFTextRun textRun2 = paragraph2.addNewTextRun();
        textRun2.setText(modificationDate);
        textRun2.setFontSize(Slideshow.CONTENT_FONT_SIZE);

        SlideHelper.createImage(newSlide, resourceData, contentType,
                Slideshow.MAIN_CONTENT_MARGIN_TOP, Slideshow.MAIN_IMAGE_CONTENT_HEIGHT);

        return newSlide;

    }
}