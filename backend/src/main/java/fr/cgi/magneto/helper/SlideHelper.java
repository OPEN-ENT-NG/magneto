package fr.cgi.magneto.helper;

import java.awt.Rectangle;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;

public class SlideHelper {
    private static final int MARGIN_LEFT = 50;
    private static final int MARGIN_TOP_TITLE = 20;
    private static final int MARGIN_TOP_CONTENT = 140;
    private static final int WIDTH = 1280;
    private static final int TITLE_HEIGHT = 80;
    private static final int CONTENT_HEIGHT = 620;
    private static final double FONT_SIZE_TITLE = 32.0;

    public static XSLFTextBox createTitle(XSLFSlide slide, String title) {
        XSLFTextBox titleBox = slide.createTextBox();
        titleBox.setAnchor(new Rectangle(MARGIN_LEFT, MARGIN_TOP_TITLE, WIDTH, TITLE_HEIGHT));

        XSLFTextParagraph titlePara = titleBox.addNewTextParagraph();
        titlePara.setTextAlign(TextAlign.CENTER);

        XSLFTextRun titleRun = titlePara.addNewTextRun();
        titleRun.setText(title);
        titleRun.setFontSize(FONT_SIZE_TITLE);
        titleRun.setBold(true);

        return titleBox;
    }

    public static XSLFTextBox createContent(XSLFSlide slide) {
        XSLFTextBox contentBox = slide.createTextBox();
        contentBox.setAnchor(new Rectangle(MARGIN_LEFT, MARGIN_TOP_CONTENT, WIDTH, CONTENT_HEIGHT));
        return contentBox;
    }
}