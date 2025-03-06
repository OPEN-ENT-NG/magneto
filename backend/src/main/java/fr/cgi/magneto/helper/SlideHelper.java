package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.model.slides.SlideMedia;
import io.vertx.core.json.JsonObject;
import org.apache.poi.openxml4j.opc.*;
import org.apache.poi.sl.usermodel.PictureData.PictureType;
import org.apache.poi.sl.usermodel.Placeholder;
import org.apache.poi.sl.usermodel.PlaceholderDetails;
import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;
import org.apache.poi.xslf.usermodel.*;
import org.apache.xmlbeans.XmlCursor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.openxmlformats.schemas.drawingml.x2006.main.CTHyperlink;
import org.openxmlformats.schemas.presentationml.x2006.main.*;

import javax.imageio.ImageIO;
import javax.xml.namespace.QName;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Set;

import static org.apache.poi.openxml4j.opc.PackageRelationshipTypes.CORE_PROPERTIES_ECMA376_NS;

public class SlideHelper {

    public static XSLFTextBox createTitle(XSLFSlide slide, String title, int titleHeight, Double titleFontSize,
            TextAlign titleTextAlign) {
        XSLFTextShape titleShape = slide.createTextBox();
        titleShape.setAnchor(
                new Rectangle(Slideshow.MARGIN_LEFT, Slideshow.MARGIN_TOP_TITLE, Slideshow.WIDTH, titleHeight));

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

    public static void addNotes(XSLFSlide newSlide, String description) {
        Document doc = Jsoup.parse(description);
        doc.select(Slideshow.CSS_STYLE).remove();
        String text = doc.text();

        XSLFNotes note = newSlide.getSlideShow().getNotesSlide(newSlide);

        // insert text
        for (XSLFTextShape shape : note.getPlaceholders()) {
            if (shape.getTextType() == Placeholder.BODY) {
                shape.setText(text);
                break;
            }
        }
    }

    public static XSLFTextBox createLegend(XSLFSlide slide, String legendText) {
        XSLFTextBox legendShape = slide.createTextBox();

        int slideHeight = slide.getSlideShow().getPageSize().height;
        int legendY = slideHeight - Slideshow.LEGEND_HEIGHT - Slideshow.LEGEND_MARGIN_BOTTOM;

        legendShape.setAnchor(new Rectangle(Slideshow.MARGIN_LEFT, legendY, Slideshow.WIDTH, Slideshow.LEGEND_HEIGHT));

        legendShape.clearText();
        legendShape.setText(legendText);

        XSLFTextParagraph para = legendShape.getTextParagraphs().get(0);
        para.setTextAlign(TextAlign.LEFT);

        XSLFTextRun run = para.getTextRuns().get(0);
        run.setFontSize(Slideshow.LEGEND_FONT_SIZE);
        run.setFontFamily(Slideshow.LEGEND_FONT_FAMILY);

        return legendShape;
    }

    public static XSLFTextBox createContent(XSLFSlide slide) {
        XSLFTextBox contentBox = slide.createTextBox();
        contentBox.setAnchor(new Rectangle(Slideshow.MARGIN_LEFT, Slideshow.CONTENT_MARGIN_TOP, Slideshow.WIDTH,
                Slideshow.CONTENT_HEIGHT));
        return contentBox;
    }

    public static XSLFPictureShape createImage(XSLFSlide slide, byte[] pictureData, String fileContentType,
                                               int contentMarginTop, int imageContentHeight, Boolean alignLeft) {
        XMLSlideShow ppt = slide.getSlideShow();

        XSLFPictureData pic = ppt.addPicture(pictureData, getPictureTypeFromContentType(fileContentType));

        java.awt.Dimension imgSize = pic.getImageDimension();

        int availableWidth = Slideshow.WIDTH;

        // Calculer les dimensions tout en préservant le ratio
        double scaleFactor = Math.min(
                (double) availableWidth / imgSize.width,
                (double) imageContentHeight / imgSize.height
        );

        int newWidth = (int) (imgSize.width * scaleFactor);
        int newHeight = (int) (imgSize.height * scaleFactor);

        // Calculer la position X en fonction de l'alignement
        int x = alignLeft ?
                Slideshow.MARGIN_LEFT :
                Slideshow.MARGIN_LEFT + (availableWidth - newWidth) / 2;

        // Centrer verticalement dans l'espace alloué
        int y = contentMarginTop + (imageContentHeight - newHeight) / 2;

        XSLFPictureShape shape = slide.createPicture(pic);
        shape.setAnchor(new Rectangle(x, y, newWidth, newHeight));

        return shape;
    }

    public static XSLFPictureShape createImageWidthHeight(XSLFSlide slide, byte[] pictureData, String fileContentType,
                                               int contentMarginTop, int imageContentHeight, int imageContentWidth, Boolean alignLeft) {
        XMLSlideShow ppt = slide.getSlideShow();

        XSLFPictureData pic = ppt.addPicture(pictureData, getPictureTypeFromContentType(fileContentType));

        int x = alignLeft ? Slideshow.MARGIN_LEFT : Slideshow.MARGIN_LEFT + (Slideshow.WIDTH - imageContentWidth) / 2;

        XSLFPictureShape shape = slide.createPicture(pic);
        shape.setAnchor(new Rectangle(x, contentMarginTop, imageContentWidth, imageContentHeight));

        return shape;
    }

    public static XSLFTextBox createLink(XSLFSlide slide, String url) {
        // Créer une zone de texte pour le lien
        XSLFTextBox linkBox = slide.createTextBox();
        int linkPositionY = Slideshow.MARGIN_TOP_TITLE + Slideshow.TITLE_HEIGHT + 10;
        // Positionner la zone de texte en utilisant les constantes existantes

        linkBox.setAnchor(new Rectangle(
                Slideshow.MARGIN_LEFT,
                linkPositionY,
                Slideshow.WIDTH,
                50));

        // Créer un paragraphe pour le texte du lien
        XSLFTextParagraph paragraph = linkBox.addNewTextParagraph();
        paragraph.setTextAlign(TextAlign.LEFT);

        // Créer un TextRun avec l'URL comme texte affiché
        XSLFTextRun textRun = paragraph.addNewTextRun();
        textRun.setText(url);
        textRun.setFontSize(Slideshow.CONTENT_FONT_SIZE);
        textRun.setFontColor(new Color(0, 0, 255)); // Bleu pour indiquer un lien
        textRun.setUnderlined(true); // Souligné pour indiquer un lien

        // Utiliser XSLFHyperlink pour créer le lien
        XSLFHyperlink hyperlink = textRun.createHyperlink();
        hyperlink.setAddress(url);

        return linkBox;
    }

    public static XSLFTextBox createBoardInfoList(XSLFSlide slide, String ownerName, String modificationDate,
            int resourceNumber,
            boolean isShare, boolean isPublic, JsonObject i18ns) {
        // Créer une zone de texte pour la liste
        XSLFTextBox infoBox = slide.createTextBox();

        int listPositionY = Slideshow.MAIN_CONTENT_MARGIN_TOP;
        infoBox.setAnchor(
                new Rectangle(Slideshow.WIDTH - Slideshow.MARGIN_LEFT * 5, listPositionY, Slideshow.BOARD_TEXT_WIDTH, 200));

        XSLFTextParagraph paragraph1 = infoBox.addNewTextParagraph();
        paragraph1.setSpaceBefore(0.0);
        XSLFTextRun textRun1 = paragraph1.addNewTextRun();
        textRun1.setText("• " + i18ns.getString(CollectionsConstant.I18N_SLIDESHOW_OWNER) + ownerName);
        textRun1.setFontSize(Slideshow.CONTENT_FONT_SIZE);

        if (modificationDate != null && !modificationDate.isEmpty()) {
            XSLFTextParagraph paragraphDate = infoBox.addNewTextParagraph();
            XSLFTextRun textRunDate = paragraphDate.addNewTextRun();
            textRunDate.setText(
                    "• " + i18ns.getString(CollectionsConstant.I18N_SLIDESHOW_UPDATED) + formatDate(modificationDate));
            textRunDate.setFontSize(Slideshow.CONTENT_FONT_SIZE);
        }

        XSLFTextParagraph paragraph2 = infoBox.addNewTextParagraph();
        XSLFTextRun textRun2 = paragraph2.addNewTextRun();
        textRun2.setText("• " + resourceNumber + " " + i18ns.getString(CollectionsConstant.I18N_SLIDESHOW_MAGNETS));
        textRun2.setFontSize(Slideshow.CONTENT_FONT_SIZE);

        // 3. Tableau partagé (si applicable)
        if (isShare) {
            XSLFTextParagraph paragraph3 = infoBox.addNewTextParagraph();
            XSLFTextRun textRun3 = paragraph3.addNewTextRun();
            textRun3.setText("• " + i18ns.getString(CollectionsConstant.I18N_SLIDESHOW_SHARED));
            textRun3.setFontSize(Slideshow.CONTENT_FONT_SIZE);
        }

        // 4. Tableau de la plateforme
        if (isPublic) {
            XSLFTextParagraph paragraph4 = infoBox.addNewTextParagraph();
            XSLFTextRun textRun4 = paragraph4.addNewTextRun();
            textRun4.setText("• " + i18ns.getString(CollectionsConstant.I18N_SLIDESHOW_PLATFORM));
            textRun4.setFontSize(Slideshow.CONTENT_FONT_SIZE);
        }

        return infoBox;
    }

    public static XSLFPictureShape createMedia(XSLFSlide slide, byte[] mediaData, String fileContentType,
            SlideMedia.MediaType mediaType) {

        if (mediaType != SlideMedia.MediaType.AUDIO && mediaType != SlideMedia.MediaType.VIDEO) {
            throw new IllegalArgumentException("Type de média non supporté: " + mediaType);
        }

        boolean isAudio = mediaType == SlideMedia.MediaType.AUDIO;
        String extension = getExtensionFromContentType(fileContentType);

        try {
            // Générer un nom pour le fichier média
            String mediaTypeStr = isAudio ? Slideshow.MEDIA_TYPE_AUDIO : Slideshow.MEDIA_TYPE_VIDEO;
            String mediaFileName = mediaTypeStr + "_" + System.currentTimeMillis() + "." + extension;

            // Créer et stocker le fichier média
            XMLSlideShow ppt = slide.getSlideShow();
            OPCPackage opcPackage = ppt.getPackage();

            PackagePartName mediaPartName = PackagingURIHelper
                    .createPartName(Slideshow.MEDIA_PATH_PREFIX + mediaFileName);
            PackagePart mediaPart = opcPackage.createPart(mediaPartName, fileContentType);

            try (OutputStream out = mediaPart.getOutputStream()) {
                out.write(mediaData);
            }

            // Obtenir la partie du slide
            PackagePart pp = slide.getPackagePart();

            // Créer deux relations vers le fichier média
            PackageRelationship prsEmbed = pp.addRelationship(
                    mediaPart.getPartName(), TargetMode.INTERNAL,
                    Slideshow.RELATIONSHIP_MEDIA);

            String execRelationship = isAudio ? Slideshow.RELATIONSHIP_AUDIO : Slideshow.RELATIONSHIP_VIDEO;
            PackageRelationship prsExec = pp.addRelationship(
                    mediaPart.getPartName(), TargetMode.INTERNAL,
                    execRelationship);

            // Créer l'icône ou la miniature
            byte[] iconData = isAudio ? getAudioIcon() : getVideoThumbnail(mediaData, extension);
            XSLFPictureData snap = ppt.addPicture(iconData, PictureType.PNG);

            XSLFPictureShape pic = isAudio ? createAndPositionMediaIcon(slide, iconData)
                    : createAndPositionVideoThumbnail(slide, iconData);

            // Configurer les propriétés de l'image pour le média
            CTPicture xpic = (CTPicture) pic.getXmlObject();

            CTHyperlink link = xpic.getNvPicPr().getCNvPr().addNewHlinkClick();
            link.setId("");
            link.setAction(Slideshow.ACTION_MEDIA);

            // Ajouter les propriétés au média
            CTApplicationNonVisualDrawingProps nvPr = xpic.getNvPicPr().getNvPr();
            if (isAudio) {
                nvPr.addNewAudioFile().setLink(prsExec.getId());
            } else {
                nvPr.addNewVideoFile().setLink(prsExec.getId());
            }

            // Ajouter l'extension média
            CTExtension ext = nvPr.addNewExtLst().addNewExt();
            ext.setUri(Slideshow.EXTENSION_URI_MEDIA);

            // Configurer l'élément p14:media
            try (XmlCursor cur = ext.newCursor()) {
                cur.toEndToken();
                cur.beginElement(new QName(Slideshow.NAMESPACE_POWERPOINT_2010, "media", "p14"));
                cur.insertNamespace("p14", Slideshow.NAMESPACE_POWERPOINT_2010);
                cur.insertNamespace("r", CORE_PROPERTIES_ECMA376_NS);
                cur.insertAttributeWithValue(
                        new QName(CORE_PROPERTIES_ECMA376_NS, "embed"),
                        prsEmbed.getId());
            }

            // S'assurer que le blipFill utilise le bon ID pour l'image
            String imageRelId = slide.getRelationId(snap);
            if (imageRelId != null) {
                xpic.getBlipFill().getBlip().setEmbed(imageRelId);
            }

            // Ajouter la section timing - CRUCIAL
            CTSlide xslide = slide.getXmlObject();
            CTTimeNodeList ctnl;

            if (!xslide.isSetTiming()) {
                CTTLCommonTimeNodeData ctn = xslide.addNewTiming().addNewTnLst().addNewPar().addNewCTn();
                ctn.setId(Slideshow.TIMING_ROOT_ID);
                ctn.setDur(STTLTimeIndefinite.INDEFINITE);
                ctn.setRestart(STTLTimeNodeRestartType.NEVER);
                ctn.setNodeType(STTLTimeNodeType.TM_ROOT);
                ctnl = ctn.addNewChildTnLst();
            } else {
                ctnl = xslide.getTiming().getTnLst().getParArray(0).getCTn().getChildTnLst();
            }

            // Ajouter le nœud média approprié (audio ou vidéo)
            CTTLCommonMediaNodeData cmedia = isAudio ? ctnl.addNewAudio().addNewCMediaNode()
                    : ctnl.addNewVideo().addNewCMediaNode();
            cmedia.setVol(Slideshow.MEDIA_VOLUME);

            CTTLCommonTimeNodeData ctn = cmedia.addNewCTn();
            ctn.setId(Slideshow.TIMING_MEDIA_ID);
            ctn.setFill(STTLTimeNodeFillType.HOLD);
            ctn.setDisplay(false);

            ctn.addNewStCondLst().addNewCond().setDelay(STTLTimeIndefinite.INDEFINITE);

            cmedia.addNewTgtEl().addNewSpTgt().setSpid(pic.getShapeId());

            return pic;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private static PictureType getPictureTypeFromContentType(String contentType) {
        if (contentType == null) {
            return PictureType.PNG;
        }

        String lowerContentType = contentType.toLowerCase();

        switch (lowerContentType) {
            case Slideshow.CONTENT_TYPE_IMAGE_JPEG:
            case Slideshow.CONTENT_TYPE_IMAGE_JPG:
                return PictureType.JPEG;
            case Slideshow.CONTENT_TYPE_IMAGE_PNG:
                return PictureType.PNG;
            case Slideshow.CONTENT_TYPE_IMAGE_GIF:
                return PictureType.GIF;
            case Slideshow.CONTENT_TYPE_IMAGE_TIFF:
                return PictureType.TIFF;
            case Slideshow.CONTENT_TYPE_IMAGE_X_EMF:
                return PictureType.EMF;
            case Slideshow.CONTENT_TYPE_IMAGE_X_WMF:
                return PictureType.WMF;
            case Slideshow.CONTENT_TYPE_IMAGE_X_PICT:
                return PictureType.PICT;
            case Slideshow.CONTENT_TYPE_IMAGE_DIB:
                return PictureType.DIB;
            case Slideshow.CONTENT_TYPE_IMAGE_X_EPS:
                return PictureType.EPS;
            case Slideshow.CONTENT_TYPE_IMAGE_X_MS_BMP:
            case Slideshow.CONTENT_TYPE_IMAGE_BMP:
                return PictureType.BMP;
            case Slideshow.CONTENT_TYPE_IMAGE_X_WPG:
                return PictureType.WPG;
            case Slideshow.CONTENT_TYPE_IMAGE_VND_MS_PHOTO:
                return PictureType.WDP;
            case Slideshow.CONTENT_TYPE_IMAGE_SVG_XML:
                return PictureType.SVG;
            default:
                return PictureType.PNG;
        }
    }

    private static XSLFPictureShape createAndPositionMediaIcon(XSLFSlide slide, byte[] iconData) {

        XMLSlideShow ppt = slide.getSlideShow();
        XSLFPictureData snap = ppt.addPicture(iconData, PictureType.PNG);

        XSLFPictureShape pic = slide.createPicture(snap);

        // Définir une taille plus grande
        int iconWidth = Slideshow.ICON_WIDTH;
        int iconHeight = Slideshow.ICON_HEIGHT;

        // Calculer la position verticale centrée
        int y = (Slideshow.SLIDE_HEIGHT - iconHeight) / 2; // Centre vertical

        // Utiliser le MARGIN_LEFT existant pour l'alignement horizontal
        pic.setAnchor(new Rectangle(Slideshow.MARGIN_LEFT, y, iconWidth, iconHeight));

        return pic;
    }

    private static byte[] getAudioIcon() {
        try {
            BufferedImage image = new BufferedImage(
                    Slideshow.AUDIO_ICON_WIDTH,
                    Slideshow.AUDIO_ICON_HEIGHT,
                    BufferedImage.TYPE_INT_ARGB);

            Graphics2D g2d = image.createGraphics();

            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g2d.setColor(Slideshow.AUDIO_ICON_BACKGROUND_COLOR);
            g2d.fillOval(
                    Slideshow.AUDIO_ICON_CIRCLE_X,
                    Slideshow.AUDIO_ICON_CIRCLE_Y,
                    Slideshow.AUDIO_ICON_CIRCLE_WIDTH,
                    Slideshow.AUDIO_ICON_CIRCLE_HEIGHT);

            g2d.setColor(Slideshow.AUDIO_ICON_PLAY_COLOR);
            g2d.fillPolygon(
                    Slideshow.AUDIO_ICON_TRIANGLE_X,
                    Slideshow.AUDIO_ICON_TRIANGLE_Y,
                    Slideshow.AUDIO_ICON_TRIANGLE_X.length);

            // Libérer les ressources
            g2d.dispose();

            // Convertir l'image en tableau de bytes (PNG)
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, Slideshow.AUDIO_ICON_FORMAT, baos);
            return baos.toByteArray();

        } catch (IOException e) {
            e.printStackTrace();
            return Slideshow.FALLBACK_PNG;
        }
    }

    private static XSLFPictureShape createAndPositionVideoThumbnail(XSLFSlide slide, byte[] thumbnailData) {

        XMLSlideShow ppt = slide.getSlideShow();
        XSLFPictureData snap = ppt.addPicture(thumbnailData, PictureType.PNG);

        XSLFPictureShape pic = slide.createPicture(snap);

        int videoWidth = Slideshow.VIDEO_DISPLAY_WIDTH;
        int videoHeight = Slideshow.VIDEO_DISPLAY_HEIGHT;

        int x = (Slideshow.SLIDE_WIDTH - videoWidth) / 2; // Centre horizontal
        int y = (Slideshow.SLIDE_HEIGHT - videoHeight) / 2; // Centre vertical

        pic.setAnchor(new Rectangle(x, y, videoWidth, videoHeight));

        return pic;
    }

    private static byte[] getVideoThumbnail(byte[] videoData, String extension) {
        try {
            // Dans un cas réel, on extrairait une image de la vidéo ici
            // Pour cet exemple, nous allons simplement créer une vignette générique

            // Créer une image au format 16:9
            BufferedImage image = new BufferedImage(
                    Slideshow.VIDEO_THUMBNAIL_WIDTH,
                    Slideshow.VIDEO_THUMBNAIL_HEIGHT,
                    BufferedImage.TYPE_INT_RGB);

            // Obtenir le contexte graphique
            Graphics2D g2d = image.createGraphics();

            // Activer l'antialiasing pour des bords plus lisses
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Remplir le fond avec un dégradé bleu foncé
            g2d.setColor(Slideshow.VIDEO_BACKGROUND_COLOR);
            g2d.fillRect(0, 0, Slideshow.VIDEO_THUMBNAIL_WIDTH, Slideshow.VIDEO_THUMBNAIL_HEIGHT);

            // Dessiner un symbole de lecture au centre
            g2d.setColor(Slideshow.VIDEO_PLAY_BUTTON_COLOR);
            int centerX = Slideshow.VIDEO_THUMBNAIL_WIDTH / 2;
            int centerY = Slideshow.VIDEO_THUMBNAIL_HEIGHT / 2;
            int radius = Slideshow.VIDEO_PLAY_BUTTON_RADIUS;
            g2d.fillOval(centerX - radius, centerY - radius, radius * 2, radius * 2);

            // Triangle de lecture
            g2d.setColor(Slideshow.VIDEO_BACKGROUND_COLOR);
            int[] xPoints = {
                    centerX - Slideshow.VIDEO_PLAY_TRIANGLE_OFFSET_X,
                    centerX + Slideshow.VIDEO_PLAY_TRIANGLE_OFFSET_X2,
                    centerX - Slideshow.VIDEO_PLAY_TRIANGLE_OFFSET_X
            };
            int[] yPoints = {
                    centerY - Slideshow.VIDEO_PLAY_TRIANGLE_OFFSET_Y,
                    centerY,
                    centerY + Slideshow.VIDEO_PLAY_TRIANGLE_OFFSET_Y
            };
            g2d.fillPolygon(xPoints, yPoints, 3);

            // Ajouter le texte "VIDÉO"
            g2d.setColor(Slideshow.VIDEO_TEXT_COLOR);
            g2d.setFont(new java.awt.Font(
                    Slideshow.VIDEO_THUMBNAIL_FONT,
                    Slideshow.VIDEO_THUMBNAIL_FONT_STYLE,
                    Slideshow.VIDEO_THUMBNAIL_FONT_SIZE));
            java.awt.FontMetrics fm = g2d.getFontMetrics();
            String text = Slideshow.VIDEO_THUMBNAIL_TEXT;
            int textWidth = fm.stringWidth(text);
            g2d.drawString(text, centerX - textWidth / 2, centerY + Slideshow.VIDEO_TEXT_Y_OFFSET);

            // Libérer les ressources
            g2d.dispose();

            // Convertir l'image en tableau de bytes (PNG)
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, Slideshow.VIDEO_THUMBNAIL_FORMAT, baos);
            return baos.toByteArray();

        } catch (IOException e) {
            e.printStackTrace();
            return getDefaultThumbnail();
        }
    }

    private static byte[] getDefaultThumbnail() {
        try {
            // Créer une image simple par défaut
            BufferedImage image = new BufferedImage(Slideshow.THUMBNAIL_WIDTH, Slideshow.THUMBNAIL_HEIGHT,
                    BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = image.createGraphics();
            g2d.setColor(Color.DARK_GRAY);
            g2d.fillRect(0, 0, Slideshow.THUMBNAIL_WIDTH, Slideshow.THUMBNAIL_HEIGHT);
            g2d.setColor(Color.WHITE);
            g2d.setFont(new java.awt.Font(Slideshow.THUMBNAIL_FONT, Slideshow.THUMBNAIL_FONT_STYLE,
                    Slideshow.THUMBNAIL_FONT_SIZE));
            g2d.drawString(Slideshow.THUMBNAIL_DEFAULT_TEXT, Slideshow.THUMBNAIL_TEXT_X, Slideshow.THUMBNAIL_TEXT_Y);
            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, Slideshow.THUMBNAIL_FORMAT, baos);
            return baos.toByteArray();
        } catch (IOException e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    private static String getExtensionFromContentType(String contentType) {
        if (contentType == null) {
            return Slideshow.DEFAULT_VIDEO_EXTENSION;
        }

        String lowerContentType = contentType.toLowerCase();

        switch (lowerContentType) {
            // Types audio
            case Slideshow.CONTENT_TYPE_AUDIO_MPEG:
            case Slideshow.CONTENT_TYPE_AUDIO_MP3:
                return Slideshow.EXT_MP3;
            case Slideshow.CONTENT_TYPE_AUDIO_WAV:
            case Slideshow.CONTENT_TYPE_AUDIO_X_WAV:
                return Slideshow.EXT_WAV;
            case Slideshow.CONTENT_TYPE_AUDIO_MP4:
            case Slideshow.CONTENT_TYPE_AUDIO_X_M4A:
                return Slideshow.EXT_M4A;
            case Slideshow.CONTENT_TYPE_AUDIO_OGG:
                return Slideshow.EXT_OGG;

            // Types vidéo
            case Slideshow.CONTENT_TYPE_VIDEO_MP4:
                return Slideshow.EXT_MP4;
            case Slideshow.CONTENT_TYPE_VIDEO_MPEG:
                return Slideshow.EXT_MPG;
            case Slideshow.CONTENT_TYPE_VIDEO_X_MS_WMV:
                return Slideshow.EXT_WMV;
            case Slideshow.CONTENT_TYPE_VIDEO_QUICKTIME:
                return Slideshow.EXT_MOV;
            case Slideshow.CONTENT_TYPE_VIDEO_X_MATROSKA:
                return Slideshow.EXT_MKV;
            case Slideshow.CONTENT_TYPE_VIDEO_WEBM:
                return Slideshow.EXT_WEBM;
            case Slideshow.CONTENT_TYPE_VIDEO_X_FLV:
                return Slideshow.EXT_FLV;
            case Slideshow.CONTENT_TYPE_VIDEO_3GPP:
                return Slideshow.EXT_3GP;
            case Slideshow.CONTENT_TYPE_VIDEO_AVI:
            case Slideshow.CONTENT_TYPE_VIDEO_X_MSVIDEO:
                return Slideshow.EXT_AVI;

            default:
                if (lowerContentType.startsWith(Slideshow.CONTENT_TYPE_AUDIO)) {
                    return Slideshow.DEFAULT_AUDIO_EXTENSION;
                } else if (lowerContentType.startsWith(Slideshow.CONTENT_TYPE_VIDEO)) {
                    return Slideshow.DEFAULT_VIDEO_EXTENSION;
                } else {
                    return null;
                }
        }
    }

    private static String formatDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return "";
        }

        try {
            java.text.SimpleDateFormat inputFormat = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

            java.text.SimpleDateFormat outputFormat = new java.text.SimpleDateFormat("dd/MM/yyyy");

            java.util.Date date = inputFormat.parse(dateString);
            return outputFormat.format(date);
        } catch (java.text.ParseException e) {
            return dateString;
        }
    }

    public static String generateUniqueFileName(Set<String> usedFileNames, String originalFileName) {
        if (!usedFileNames.contains(originalFileName)) {
            usedFileNames.add(originalFileName);
            return originalFileName;
        }

        String fileNameWithoutExtension = getFileNameWithoutExtension(originalFileName);
        String extension = getFileExtension(originalFileName);

        int counter = 1;
        String uniqueFileName;
        do {
            uniqueFileName = fileNameWithoutExtension + " (" + counter + ")." + extension;
            counter++;
        } while (usedFileNames.contains(uniqueFileName));

        usedFileNames.add(uniqueFileName);
        return uniqueFileName;
    }

    private static String getFileNameWithoutExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? fileName : fileName.substring(0, dotIndex);
    }

    private static String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fileName.substring(dotIndex + 1);
    }
}