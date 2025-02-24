package fr.cgi.magneto.helper;

import org.apache.poi.sl.usermodel.PictureData.PictureType;
import org.apache.poi.sl.usermodel.Placeholder;
import org.apache.poi.sl.usermodel.PlaceholderDetails;
import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;
import org.apache.poi.xslf.usermodel.*;

import java.awt.*;

public class SlideHelper {
    private static final int MARGIN_LEFT = 140;
    private static final int MARGIN_TOP_TITLE = 40;
    private static final int WIDTH = 1000;

    private static final int TITLE_HEIGHT = 70;
    private static final Double TITLE_FONT_SIZE = 44.0;

    private static final int LEGEND_HEIGHT = 70;
    private static final int LEGEND_MARGIN_BOTTOM = 20;
    private static final Double LEGEND_FONT_SIZE = 16.0;
    private static final String LEGEND_FONT_FAMILY = "Roboto";

    private static final int CONTENT_HEIGHT = 520;
    private static final int CONTENT_MARGIN_TOP = 140;

    private static final int IMAGE_CONTENT_HEIGHT = 480;

    public static XSLFTextBox createTitle(XSLFSlide slide, String title, int titleHeight, Double titleFontSize,
                                          TextAlign titleTextAlign) {
        XSLFTextShape titleShape = slide.createTextBox();
        titleShape.setAnchor(new Rectangle(MARGIN_LEFT, MARGIN_TOP_TITLE, WIDTH, titleHeight));

        PlaceholderDetails phDetails = titleShape.getPlaceholderDetails();
        if (phDetails != null) {
            phDetails.setPlaceholder(Placeholder.TITLE);
        }

        titleShape.clearText();
        titleShape.setText(title);

        XSLFTextParagraph para = titleShape.getTextParagraphs().get(0);
        para.setTextAlign(titleTextAlign);

        XSLFTextRun run = para.getTextRuns().get(0);
        run.setFontSize(titleFontSize);

        return (XSLFTextBox) titleShape;
    }

    public static XSLFTextBox createLegend(XSLFSlide slide, String legendText) {
        XSLFTextBox legendShape = slide.createTextBox();

        int slideHeight = slide.getSlideShow().getPageSize().height;
        int legendY = slideHeight - LEGEND_HEIGHT - LEGEND_MARGIN_BOTTOM;

        legendShape.setAnchor(new Rectangle(MARGIN_LEFT, legendY, WIDTH, LEGEND_HEIGHT));

        legendShape.clearText();
        legendShape.setText(legendText);

        XSLFTextParagraph para = legendShape.getTextParagraphs().get(0);
        para.setTextAlign(TextAlign.LEFT);

        XSLFTextRun run = para.getTextRuns().get(0);
        run.setFontSize(LEGEND_FONT_SIZE);
        run.setFontFamily(LEGEND_FONT_FAMILY);

        return legendShape;
    }

    public static XSLFTextBox createContent(XSLFSlide slide) {
        XSLFTextBox contentBox = slide.createTextBox();
        contentBox.setAnchor(new Rectangle(MARGIN_LEFT, CONTENT_MARGIN_TOP, WIDTH, CONTENT_HEIGHT));
        return contentBox;
    }

    public static XSLFPictureShape createImage(XSLFSlide slide, byte[] pictureData, String extension) {
        XMLSlideShow ppt = slide.getSlideShow();

        XSLFPictureData pic = ppt.addPicture(pictureData, getPictureTypeFromExtension(extension));

        java.awt.Dimension imgSize = pic.getImageDimension();
        double imgRatio = (double) imgSize.width / imgSize.height;

        int newWidth, newHeight;
        if (imgRatio > (double) WIDTH / IMAGE_CONTENT_HEIGHT) {
            newWidth = WIDTH;
            newHeight = (int) (WIDTH / imgRatio);
        } else {
            newHeight = IMAGE_CONTENT_HEIGHT;
            newWidth = (int) (IMAGE_CONTENT_HEIGHT * imgRatio);
        }

        int x = MARGIN_LEFT + (WIDTH - newWidth) / 2;
        int y = CONTENT_MARGIN_TOP + (IMAGE_CONTENT_HEIGHT - newHeight) / 2;

        XSLFPictureShape shape = slide.createPicture(pic);
        shape.setAnchor(new Rectangle(x, y, newWidth, newHeight));

        return shape;
    }

    private static PictureType getPictureTypeFromExtension(String extension) {
        String cleanExt = extension.toLowerCase();
        if (!cleanExt.startsWith(".")) {
            cleanExt = "." + cleanExt;
        }

        for (PictureType type : PictureType.values()) {
            if (type.extension.equals(cleanExt)) {
                return type;
            }
        }

        return PictureType.PNG;
    }
}