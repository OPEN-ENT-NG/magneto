package fr.cgi.magneto.helper;

import java.awt.Rectangle;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFPictureShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.poi.sl.usermodel.Placeholder;
import org.apache.poi.sl.usermodel.PlaceholderDetails;
import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;

public class SlideHelper {
    private static final int MARGIN_LEFT = 140;
    private static final int MARGIN_TOP_TITLE = 40;
    private static final int WIDTH = 1000;

    private static final int TITLE_HEIGHT = 70;
    private static final Double TITLE_FONT_SIZE = 44.0;
    private static final String TITLE_FONT_FAMILY = "Comfortaa";

    private static final int CONTENT_HEIGHT = 520;
    private static final int CONTENT_MARGIN_TOP = 140;

    public static XSLFTextBox createTitle(XSLFSlide slide, String title) {
        XSLFTextShape titleShape = slide.createTextBox();
        titleShape.setAnchor(new Rectangle(MARGIN_LEFT, MARGIN_TOP_TITLE, WIDTH, TITLE_HEIGHT));

        PlaceholderDetails phDetails = titleShape.getPlaceholderDetails();
        if (phDetails != null) {
            phDetails.setPlaceholder(Placeholder.TITLE);
        }

        titleShape.clearText();
        titleShape.setText(title);

        XSLFTextParagraph para = titleShape.getTextParagraphs().get(0);
        para.setTextAlign(TextAlign.LEFT);
        
        XSLFTextRun run = para.getTextRuns().get(0);
        run.setFontSize(TITLE_FONT_SIZE);

        return (XSLFTextBox) titleShape;
    }


    public static XSLFTextBox createContent(XSLFSlide slide) {
        XSLFTextBox contentBox = slide.createTextBox();
        contentBox.setAnchor(new Rectangle(MARGIN_LEFT, CONTENT_MARGIN_TOP, WIDTH, CONTENT_HEIGHT));
        return contentBox;
    }

    public static XSLFPictureShape createImage(XSLFSlide slide, String resourceUrl){
        byte[] pictureData = Files.readAllBytes(Paths.get(resourceUrl));
        XSLFPictureData pic = slide.addPicture(pictureData);
    }
}