package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.constants.MagnetoConstants;
import org.apache.poi.sl.usermodel.PictureData.PictureType;
import org.apache.poi.sl.usermodel.Placeholder;
import org.apache.poi.sl.usermodel.PlaceholderDetails;
import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;
import org.apache.poi.xslf.usermodel.*;

import java.awt.*;

public class SlideHelper {
    
    public static XSLFTextBox createTitle(XSLFSlide slide, String title, int titleHeight, Double titleFontSize,
                                          TextAlign titleTextAlign) {
        XSLFTextShape titleShape = slide.createTextBox();
        titleShape.setAnchor(new Rectangle(MagnetoConstants.MARGIN_LEFT, MagnetoConstants.MARGIN_TOP_TITLE, MagnetoConstants.WIDTH, titleHeight));

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
        int legendY = slideHeight - MagnetoConstants.LEGEND_HEIGHT - MagnetoConstants.LEGEND_MARGIN_BOTTOM;

        legendShape.setAnchor(new Rectangle(MagnetoConstants.MARGIN_LEFT, legendY, MagnetoConstants.WIDTH, MagnetoConstants.LEGEND_HEIGHT));

        legendShape.clearText();
        legendShape.setText(legendText);

        XSLFTextParagraph para = legendShape.getTextParagraphs().get(0);
        para.setTextAlign(TextAlign.LEFT);

        XSLFTextRun run = para.getTextRuns().get(0);
        run.setFontSize(MagnetoConstants.LEGEND_FONT_SIZE);
        run.setFontFamily(MagnetoConstants.LEGEND_FONT_FAMILY);

        return legendShape;
    }

    public static XSLFTextBox createContent(XSLFSlide slide) {
        XSLFTextBox contentBox = slide.createTextBox();
        contentBox.setAnchor(new Rectangle(MagnetoConstants.MARGIN_LEFT, MagnetoConstants.CONTENT_MARGIN_TOP, MagnetoConstants.WIDTH, MagnetoConstants.CONTENT_HEIGHT));
        return contentBox;
    }

    public static XSLFPictureShape createImage(XSLFSlide slide, byte[] pictureData, String extension, int contentMarginTop) {
        XMLSlideShow ppt = slide.getSlideShow();

        XSLFPictureData pic = ppt.addPicture(pictureData, getPictureTypeFromExtension(extension));

        java.awt.Dimension imgSize = pic.getImageDimension();
        double imgRatio = (double) imgSize.width / imgSize.height;

        int newWidth, newHeight;
        if (imgRatio > (double) MagnetoConstants.WIDTH / MagnetoConstants.IMAGE_CONTENT_HEIGHT) {
            newWidth = MagnetoConstants.WIDTH;
            newHeight = (int) (MagnetoConstants.WIDTH / imgRatio);
        } else {
            newHeight = MagnetoConstants.IMAGE_CONTENT_HEIGHT;
            newWidth = (int) (MagnetoConstants.IMAGE_CONTENT_HEIGHT * imgRatio);
        }

        int x = MagnetoConstants.MARGIN_LEFT + (MagnetoConstants.WIDTH - newWidth) / 2;
        int y = contentMarginTop + (MagnetoConstants.IMAGE_CONTENT_HEIGHT - newHeight) / 2;

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