package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;

public class SlideFile extends Slide {
    private final String filenameString;
    private final String caption;
    private final byte[] fileSvg;
    private final String fileContentType;

    public SlideFile(String title, String description, String filenameString, String caption, byte[] fileSvg, String fileContentType) {
        this.title = title;
        this.description = description;
        this.filenameString = filenameString;
        this.caption = caption;
        this.fileSvg = fileSvg;
        this.fileContentType = fileContentType;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {
        SlideHelper.createTitle(newSlide, title, Slideshow.TITLE_HEIGHT, Slideshow.DESCRIPTION_TITLE_FONT_SIZE,
                TextParagraph.TextAlign.LEFT);

        XSLFTextBox textBox = SlideHelper.createContent(newSlide);
        XSLFTextParagraph paragraph = textBox.addNewTextParagraph();
        paragraph.setTextAlign(TextParagraph.TextAlign.LEFT);
        paragraph.setLineSpacing(175.0);
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(filenameString);
        textRun.setFontSize(Slideshow.CONTENT_FONT_SIZE);
        textRun.setFontFamily(Slideshow.DEFAULT_FONT);

        SlideHelper.createImageWidthHeight(newSlide, fileSvg, fileContentType, Slideshow.MAIN_CONTENT_MARGIN_TOP,
                Slideshow.SVG_CONTENT_HEIGHT, Slideshow.SVG_CONTENT_WIDTH, true);
        SlideHelper.createLegend(newSlide, caption);

        SlideHelper.addNotes(newSlide, description);

        return newSlide;
    }
}
