package fr.cgi.magneto.helper;

import fr.cgi.magneto.core.constants.Slideshow;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import javax.imageio.ImageIO;
import javax.xml.namespace.QName;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFPictureShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.xmlbeans.XmlCursor;
import static org.apache.poi.openxml4j.opc.PackageRelationshipTypes.CORE_PROPERTIES_ECMA376_NS;
import org.openxmlformats.schemas.drawingml.x2006.main.CTHyperlink;
import org.openxmlformats.schemas.presentationml.x2006.main.CTApplicationNonVisualDrawingProps;
import org.openxmlformats.schemas.presentationml.x2006.main.CTExtension;
import org.openxmlformats.schemas.presentationml.x2006.main.CTPicture;
import org.openxmlformats.schemas.presentationml.x2006.main.CTSlide;
import org.openxmlformats.schemas.presentationml.x2006.main.CTTLCommonMediaNodeData;
import org.openxmlformats.schemas.presentationml.x2006.main.CTTLCommonTimeNodeData;
import org.openxmlformats.schemas.presentationml.x2006.main.CTTimeNodeList;
import org.openxmlformats.schemas.presentationml.x2006.main.STTLTimeIndefinite;
import org.openxmlformats.schemas.presentationml.x2006.main.STTLTimeNodeFillType;
import org.openxmlformats.schemas.presentationml.x2006.main.STTLTimeNodeRestartType;
import org.openxmlformats.schemas.presentationml.x2006.main.STTLTimeNodeType;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackagePartName;
import org.apache.poi.openxml4j.opc.PackageRelationship;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.openxml4j.opc.TargetMode;
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
        titleShape.setAnchor(new Rectangle(Slideshow.MARGIN_LEFT, Slideshow.MARGIN_TOP_TITLE, Slideshow.WIDTH, titleHeight));

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
        contentBox.setAnchor(new Rectangle(Slideshow.MARGIN_LEFT, Slideshow.CONTENT_MARGIN_TOP, Slideshow.WIDTH, Slideshow.CONTENT_HEIGHT));
        return contentBox;
    }

    public static XSLFPictureShape createImage(XSLFSlide slide, byte[] pictureData, String fileContentType, int contentMarginTop, int imageContentHeight) {
        XMLSlideShow ppt = slide.getSlideShow();

        XSLFPictureData pic = ppt.addPicture(pictureData, getPictureTypeFromContentType(fileContentType));

        java.awt.Dimension imgSize = pic.getImageDimension();
        double imgRatio = (double) imgSize.width / imgSize.height;

        int newWidth, newHeight;
        if (imgRatio > (double) Slideshow.WIDTH / imageContentHeight) {
            newWidth = Slideshow.WIDTH;
            newHeight = (int) (Slideshow.WIDTH / imgRatio);
        } else {
            newHeight = imageContentHeight;
            newWidth = (int) (imageContentHeight * imgRatio);
        }

        int x = Slideshow.MARGIN_LEFT + (Slideshow.WIDTH - newWidth) / 2;
        int y = contentMarginTop + (imageContentHeight - newHeight) / 2;

        XSLFPictureShape shape = slide.createPicture(pic);
        shape.setAnchor(new Rectangle(x, y, newWidth, newHeight));

        return shape;
    }

    public static XSLFPictureShape createAudio(XSLFSlide slide, byte[] audioData, String fileContentType) {
        System.out.println("=== DÉBUT CRÉATION AUDIO ===");
        String extension = getExtensionFromContentType(fileContentType);
        try {
            // Générer un nom pour le fichier audio
            String audioFileName = "audio_" + System.currentTimeMillis() + "." + extension;
            System.out.println("Nom fichier audio généré: " + audioFileName);

            // Créer et stocker le fichier audio
            XMLSlideShow ppt = slide.getSlideShow();
            OPCPackage opcPackage = ppt.getPackage();
            System.out.println("Package récupéré: " + opcPackage);

            PackagePartName audioPartName = PackagingURIHelper.createPartName("/ppt/media/" + audioFileName);
            System.out.println("Chemin audio créé: " + audioPartName);

            PackagePart audioPart = opcPackage.createPart(audioPartName, fileContentType);
            System.out.println("Partie audio créée: " + audioPart);

            try (OutputStream out = audioPart.getOutputStream()) {
                out.write(audioData);
                System.out.println("Données audio écrites: " + audioData.length + " octets");
            }

            // Obtenir la partie du slide
            PackagePart pp = slide.getPackagePart();
            System.out.println("Partie du slide: " + pp);

            // Créer deux relations vers le fichier audio
            System.out.println("Création des relations...");
            PackageRelationship prsEmbed = pp.addRelationship(
                    audioPart.getPartName(), TargetMode.INTERNAL,
                    "http://schemas.microsoft.com/office/2007/relationships/media");
            System.out.println("Relation média créée: " + prsEmbed.getId() + " -> " + prsEmbed.getTargetURI());

            PackageRelationship prsExec = pp.addRelationship(
                    audioPart.getPartName(), TargetMode.INTERNAL,
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio");
            System.out.println("Relation audio créée: " + prsExec.getId() + " -> " + prsExec.getTargetURI());

            // Créer l'icône de lecture
            System.out.println("Création de l'icône...");
            byte[] iconData = getAudioIcon();
            System.out.println("Icône générée: " + (iconData != null ? iconData.length : 0) + " octets");

            XSLFPictureData snap = ppt.addPicture(iconData, PictureType.PNG);

            System.out.println("Image ajoutée au PPT: " + snap.getFileName());

            XSLFPictureShape pic = createAndPositionMediaIcon(slide, iconData);
            System.out.println("Forme image créée, ID: " + pic.getShapeId());

            // Configurer les propriétés de l'image pour le média
            System.out.println("Configuration du XML...");
            CTPicture xpic = (CTPicture) pic.getXmlObject();
            System.out.println("XML de l'image récupéré");

            CTHyperlink link = xpic.getNvPicPr().getCNvPr().addNewHlinkClick();
            link.setId("");
            link.setAction("ppaction://media");
            System.out.println("Lien hypertexte configuré: " + link.getAction());

            // Ajouter les propriétés audio
            CTApplicationNonVisualDrawingProps nvPr = xpic.getNvPicPr().getNvPr();
            nvPr.addNewAudioFile().setLink(prsExec.getId());
            System.out.println("Propriété audioFile configurée avec ID: " + prsExec.getId());

            // Ajouter l'extension média
            CTExtension ext = nvPr.addNewExtLst().addNewExt();
            ext.setUri("{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}");
            System.out.println("Extension ajoutée avec URI: " + ext.getUri());

            // Configurer l'élément p14:media
            String p14Ns = "http://schemas.microsoft.com/office/powerpoint/2010/main";
            try (XmlCursor cur = ext.newCursor()) {
                cur.toEndToken();
                System.out.println("Curseur positionné à la fin de l'extension");
                cur.beginElement(new QName(p14Ns, "media", "p14"));
                System.out.println("Élément p14:media créé");
                cur.insertNamespace("p14", p14Ns);
                cur.insertNamespace("r", CORE_PROPERTIES_ECMA376_NS);
                System.out.println("Namespaces p14 et r insérés");

                // CHANGEMENT: Utiliser embed au lieu de link
                System.out.println("Tentative d'insertion de l'attribut embed avec ID: " + prsEmbed.getId());
                cur.insertAttributeWithValue(
                        new QName(CORE_PROPERTIES_ECMA376_NS, "embed"),
                        prsEmbed.getId());
                System.out.println("Attribut embed inséré");
            }

            // S'assurer que le blipFill utilise le bon ID pour l'image
            System.out.println("Vérification de la référence de l'image...");
            String imageRelId = slide.getRelationId(snap);
            if (imageRelId != null) {
                xpic.getBlipFill().getBlip().setEmbed(imageRelId);
                System.out.println("BlipFill configuré avec ID d'image: " + imageRelId);
            } else {
                System.out.println("Avertissement: Impossible de trouver la relation pour l'image");
            }

            // Ajouter la section timing - CRUCIAL
            System.out.println("Ajout des informations de timing...");
            CTSlide xslide = slide.getXmlObject();
            CTTimeNodeList ctnl;

            if (!xslide.isSetTiming()) {
                System.out.println("Timing non défini, création...");
                CTTLCommonTimeNodeData ctn = xslide.addNewTiming().addNewTnLst().addNewPar().addNewCTn();
                // CHANGEMENT: Ajouter ID au nœud temporel racine
                ctn.setId(1);
                ctn.setDur(STTLTimeIndefinite.INDEFINITE);
                ctn.setRestart(STTLTimeNodeRestartType.NEVER);
                ctn.setNodeType(STTLTimeNodeType.TM_ROOT);
                System.out.println("Timing root créé avec ID: 1");
                ctnl = ctn.addNewChildTnLst();
                System.out.println("Liste des nœuds enfants créée");
            } else {
                System.out.println("Timing déjà défini, récupération...");
                ctnl = xslide.getTiming().getTnLst().getParArray(0).getCTn().getChildTnLst();
            }

            // Utiliser addNewAudio() au lieu de addNewVideo()
            System.out.println("Ajout du nœud audio...");
            CTTLCommonMediaNodeData cmedia = ctnl.addNewAudio().addNewCMediaNode();
            cmedia.setVol(80000);
            System.out.println("Volume configuré: 80000");

            CTTLCommonTimeNodeData ctn = cmedia.addNewCTn();
            // CHANGEMENT: Ajouter ID au nœud temporel audio
            ctn.setId(2);
            ctn.setFill(STTLTimeNodeFillType.HOLD);
            ctn.setDisplay(false);
            System.out.println("Propriétés du nœud temporel configurées avec ID: 2");

            ctn.addNewStCondLst().addNewCond().setDelay(STTLTimeIndefinite.INDEFINITE);
            System.out.println("Condition de démarrage ajoutée");

            cmedia.addNewTgtEl().addNewSpTgt().setSpid(pic.getShapeId());
            System.out.println("Cible du média configurée avec ID: " + pic.getShapeId());

            // Afficher le XML pour le débogage
            System.out.println("XML final du slide: " + xslide);

            System.out.println("=== CRÉATION AUDIO TERMINÉE AVEC SUCCÈS ===");
            return pic;
        } catch (Exception e) {
            System.out.println("=== ERREUR LORS DE LA CRÉATION AUDIO ===");
            e.printStackTrace();
            return null;
        }
    }

    public static XSLFPictureShape createVideo(XSLFSlide slide, byte[] videoData, String fileContentType) {
        System.out.println("=== DÉBUT CRÉATION VIDÉO ===");
        String extension = getExtensionFromContentType(fileContentType);
        try {
            // Générer un nom pour le fichier vidéo
            String videoFileName = "video_" + System.currentTimeMillis() + "." + extension;
            System.out.println("Nom fichier vidéo généré: " + videoFileName);

            // Créer et stocker le fichier vidéo
            XMLSlideShow ppt = slide.getSlideShow();
            OPCPackage opcPackage = ppt.getPackage();
            System.out.println("Package récupéré: " + opcPackage);

            PackagePartName videoPartName = PackagingURIHelper.createPartName("/ppt/media/" + videoFileName);
            System.out.println("Chemin vidéo créé: " + videoPartName);

            PackagePart videoPart = opcPackage.createPart(videoPartName, fileContentType);
            System.out.println("Partie vidéo créée: " + videoPart);

            try (OutputStream out = videoPart.getOutputStream()) {
                out.write(videoData);
                System.out.println("Données vidéo écrites: " + videoData.length + " octets");
            }

            // Obtenir la partie du slide
            PackagePart pp = slide.getPackagePart();
            System.out.println("Partie du slide: " + pp);

            // Créer deux relations vers le fichier vidéo
            System.out.println("Création des relations...");
            PackageRelationship prsEmbed = pp.addRelationship(
                    videoPart.getPartName(), TargetMode.INTERNAL,
                    "http://schemas.microsoft.com/office/2007/relationships/media");
            System.out.println("Relation média créée: " + prsEmbed.getId() + " -> " + prsEmbed.getTargetURI());

            PackageRelationship prsExec = pp.addRelationship(
                    videoPart.getPartName(), TargetMode.INTERNAL,
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/video");
            System.out.println("Relation vidéo créée: " + prsExec.getId() + " -> " + prsExec.getTargetURI());

            // Créer une miniature de la vidéo
            System.out.println("Création de la miniature...");
            byte[] thumbnailData = getVideoThumbnail(videoData, extension);
            System.out.println("Miniature générée: " + (thumbnailData != null ? thumbnailData.length : 0) + " octets");

            XSLFPictureData snap = ppt.addPicture(thumbnailData, PictureType.PNG);
            System.out.println("Image ajoutée au PPT: " + snap.getFileName());

            // Positionner la miniature vidéo dans le slide
            XSLFPictureShape pic = createAndPositionVideoThumbnail(slide, thumbnailData);
            System.out.println("Forme image créée, ID: " + pic.getShapeId());

            // Configurer les propriétés de l'image pour le média
            System.out.println("Configuration du XML...");
            CTPicture xpic = (CTPicture) pic.getXmlObject();
            System.out.println("XML de l'image récupéré");

            CTHyperlink link = xpic.getNvPicPr().getCNvPr().addNewHlinkClick();
            link.setId("");
            link.setAction("ppaction://media");
            System.out.println("Lien hypertexte configuré: " + link.getAction());

            // Ajouter les propriétés vidéo
            CTApplicationNonVisualDrawingProps nvPr = xpic.getNvPicPr().getNvPr();
            // Pour vidéo, utiliser videoFile au lieu de audioFile
            nvPr.addNewVideoFile().setLink(prsExec.getId());
            System.out.println("Propriété videoFile configurée avec ID: " + prsExec.getId());

            // Ajouter l'extension média
            CTExtension ext = nvPr.addNewExtLst().addNewExt();
            ext.setUri("{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}");
            System.out.println("Extension ajoutée avec URI: " + ext.getUri());

            // Configurer l'élément p14:media
            String p14Ns = "http://schemas.microsoft.com/office/powerpoint/2010/main";
            try (XmlCursor cur = ext.newCursor()) {
                cur.toEndToken();
                System.out.println("Curseur positionné à la fin de l'extension");
                cur.beginElement(new QName(p14Ns, "media", "p14"));
                System.out.println("Élément p14:media créé");
                cur.insertNamespace("p14", p14Ns);
                cur.insertNamespace("r", CORE_PROPERTIES_ECMA376_NS);
                System.out.println("Namespaces p14 et r insérés");

                System.out.println("Tentative d'insertion de l'attribut embed avec ID: " + prsEmbed.getId());
                cur.insertAttributeWithValue(
                        new QName(CORE_PROPERTIES_ECMA376_NS, "embed"),
                        prsEmbed.getId());
                System.out.println("Attribut embed inséré");
            }

            // S'assurer que le blipFill utilise le bon ID pour l'image
            System.out.println("Vérification de la référence de l'image...");
            String imageRelId = slide.getRelationId(snap);
            if (imageRelId != null) {
                xpic.getBlipFill().getBlip().setEmbed(imageRelId);
                System.out.println("BlipFill configuré avec ID d'image: " + imageRelId);
            } else {
                System.out.println("Avertissement: Impossible de trouver la relation pour l'image");
            }

            // Ajouter la section timing - CRUCIAL
            System.out.println("Ajout des informations de timing...");
            CTSlide xslide = slide.getXmlObject();
            CTTimeNodeList ctnl;

            if (!xslide.isSetTiming()) {
                System.out.println("Timing non défini, création...");
                CTTLCommonTimeNodeData ctn = xslide.addNewTiming().addNewTnLst().addNewPar().addNewCTn();
                ctn.setId(1);
                ctn.setDur(STTLTimeIndefinite.INDEFINITE);
                ctn.setRestart(STTLTimeNodeRestartType.NEVER);
                ctn.setNodeType(STTLTimeNodeType.TM_ROOT);
                System.out.println("Timing root créé avec ID: 1");
                ctnl = ctn.addNewChildTnLst();
                System.out.println("Liste des nœuds enfants créée");
            } else {
                System.out.println("Timing déjà défini, récupération...");
                ctnl = xslide.getTiming().getTnLst().getParArray(0).getCTn().getChildTnLst();
            }

            // Pour vidéo, utiliser addNewVideo() au lieu de addNewAudio()
            System.out.println("Ajout du nœud vidéo...");
            CTTLCommonMediaNodeData cmedia = ctnl.addNewVideo().addNewCMediaNode();
            cmedia.setVol(80000); // Garder le volume comme pour l'audio
            System.out.println("Volume configuré: 80000");

            CTTLCommonTimeNodeData ctn = cmedia.addNewCTn();
            ctn.setId(2);
            ctn.setFill(STTLTimeNodeFillType.HOLD);
            ctn.setDisplay(false);
            System.out.println("Propriétés du nœud temporel configurées avec ID: 2");

            ctn.addNewStCondLst().addNewCond().setDelay(STTLTimeIndefinite.INDEFINITE);
            System.out.println("Condition de démarrage ajoutée");

            cmedia.addNewTgtEl().addNewSpTgt().setSpid(pic.getShapeId());
            System.out.println("Cible du média configurée avec ID: " + pic.getShapeId());

            // Afficher le XML pour le débogage
            System.out.println("XML final du slide: " + xslide);

            System.out.println("=== CRÉATION VIDÉO TERMINÉE AVEC SUCCÈS ===");
            return pic;
        } catch (Exception e) {
            System.out.println("=== ERREUR LORS DE LA CRÉATION VIDÉO ===");
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
            case "image/jpeg":
            case "image/jpg":
                return PictureType.JPEG;
            case "image/png":
                return PictureType.PNG;
            case "image/gif":
                return PictureType.GIF;
            case "image/tiff":
                return PictureType.TIFF;
            case "image/x-emf":
                return PictureType.EMF;
            case "image/x-wmf":
                return PictureType.WMF;
            case "image/x-pict":
                return PictureType.PICT;
            case "image/dib":
                return PictureType.DIB;
            case "image/x-eps":
                return PictureType.EPS;
            case "image/x-ms-bmp":
            case "image/bmp":
                return PictureType.BMP;
            case "image/x-wpg":
                return PictureType.WPG;
            case "image/vnd.ms-photo":
                return PictureType.WDP;
            case "image/svg+xml":
                return PictureType.SVG;
            default:
                System.out.println("Content type non reconnu: " + contentType + ", utilisation de PNG par défaut");
                return PictureType.PNG;
        }
    }

    private static XSLFPictureShape createAndPositionMediaIcon(XSLFSlide slide, byte[] iconData) {
        System.out.println("Création et positionnement de l'icône audio...");

        XMLSlideShow ppt = slide.getSlideShow();
        XSLFPictureData snap = ppt.addPicture(iconData, PictureType.PNG);
        System.out.println("Image ajoutée au PPT: " + snap.getFileName());

        XSLFPictureShape pic = slide.createPicture(snap);
        System.out.println("Forme image créée, ID: " + pic.getShapeId());

        // Définir une taille plus grande
        int iconWidth = 150;
        int iconHeight = 150;

        // Calculer la position verticale centrée
        int y = (Slideshow.SLIDE_HEIGHT - iconHeight) / 2; // Centre vertical

        // Utiliser le MARGIN_LEFT existant pour l'alignement horizontal
        pic.setAnchor(new Rectangle(Slideshow.MARGIN_LEFT, y, iconWidth, iconHeight));
        System.out.println("Position de l'icône ajustée: x=" + Slideshow.MARGIN_LEFT + ", y=" + y +
                ", width=" + iconWidth + ", height=" + iconHeight);

        return pic;
    }

    private static byte[] getAudioIcon() {
        try {
            // Créer une image de 100x100 pixels avec un fond transparent
            BufferedImage image = new BufferedImage(100, 100, BufferedImage.TYPE_INT_ARGB);

            // Obtenir le contexte graphique
            Graphics2D g2d = image.createGraphics();

            // Activer l'antialiasing pour des bords plus lisses
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Dessiner un cercle comme fond (bleu clair)
            g2d.setColor(new Color(0, 120, 215, 240));
            g2d.fillOval(5, 5, 90, 90);

            // Dessiner un triangle de lecture (blanc)
            g2d.setColor(Color.WHITE);
            int[] xPoints = { 35, 70, 35 };
            int[] yPoints = { 30, 50, 70 };
            g2d.fillPolygon(xPoints, yPoints, 3);

            // Libérer les ressources
            g2d.dispose();

            // Convertir l'image en tableau de bytes (PNG)
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();

        } catch (IOException e) {
            e.printStackTrace();

            // En cas d'erreur, retourner un tableau d'octets minimal pour un fichier PNG
            // (Cela créera une image minuscule mais valide)
            return new byte[] {
                    (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
                    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08,
                    0x02, 0x00, 0x00, 0x00, (byte) 0x90, 0x77, 0x53, (byte) 0xDE, 0x00, 0x00, 0x00,
                    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, (byte) 0xD7, 0x63, (byte) 0xF8, (byte) 0xCF,
                    (byte) 0xC0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x00, (byte) 0x18, (byte) 0xDD, (byte) 0x8D,
                    (byte) 0xB0, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte) 0xAE, 0x42,
                    0x60, (byte) 0x82
            };
        }
    }

    private static XSLFPictureShape createAndPositionVideoThumbnail(XSLFSlide slide, byte[] thumbnailData) {
        System.out.println("Création et positionnement de la miniature vidéo...");

        XMLSlideShow ppt = slide.getSlideShow();
        XSLFPictureData snap = ppt.addPicture(thumbnailData, PictureType.PNG);
        System.out.println("Image ajoutée au PPT: " + snap.getFileName());

        XSLFPictureShape pic = slide.createPicture(snap);
        System.out.println("Forme image créée, ID: " + pic.getShapeId());

        // Définir une taille adaptée pour la vidéo
        int videoWidth = 640;
        int videoHeight = 360; // Format 16:9 standard

        // Calculer la position centrée
        int x = (Slideshow.SLIDE_WIDTH - videoWidth) / 2; // Centre horizontal
        int y = (Slideshow.SLIDE_HEIGHT - videoHeight) / 2; // Centre vertical

        pic.setAnchor(new Rectangle(x, y, videoWidth, videoHeight));
        System.out.println("Position de la miniature ajustée: x=" + x + ", y=" + y +
                ", width=" + videoWidth + ", height=" + videoHeight);

        return pic;
    }

    private static byte[] getVideoThumbnail(byte[] videoData, String extension) {
        try {
            // Dans un cas réel, on extrairait une image de la vidéo ici
            // Pour cet exemple, nous allons simplement créer une vignette générique

            // Créer une image de 640x360 pixels (format 16:9)
            BufferedImage image = new BufferedImage(640, 360, BufferedImage.TYPE_INT_RGB);

            // Obtenir le contexte graphique
            Graphics2D g2d = image.createGraphics();

            // Activer l'antialiasing pour des bords plus lisses
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            // Remplir le fond avec un dégradé bleu foncé
            g2d.setColor(new Color(20, 20, 50));
            g2d.fillRect(0, 0, 640, 360);

            // Dessiner un symbole de lecture au centre
            g2d.setColor(new Color(255, 255, 255, 180));
            int centerX = 640 / 2;
            int centerY = 360 / 2;
            int radius = 50;
            g2d.fillOval(centerX - radius, centerY - radius, radius * 2, radius * 2);

            // Triangle de lecture
            g2d.setColor(new Color(20, 20, 50));
            int[] xPoints = { centerX - 15, centerX + 25, centerX - 15 };
            int[] yPoints = { centerY - 25, centerY, centerY + 25 };
            g2d.fillPolygon(xPoints, yPoints, 3);

            // Ajouter le texte "VIDÉO"
            g2d.setColor(Color.WHITE);
            g2d.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 24));
            java.awt.FontMetrics fm = g2d.getFontMetrics();
            String text = "VIDÉO";
            int textWidth = fm.stringWidth(text);
            g2d.drawString(text, centerX - textWidth / 2, centerY + 80);

            // Libérer les ressources
            g2d.dispose();

            // Convertir l'image en tableau de bytes (PNG)
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();

        } catch (IOException e) {
            e.printStackTrace();
            return getDefaultThumbnail();
        }
    }

    private static byte[] getDefaultThumbnail() {
        try {
            // Créer une image simple par défaut
            BufferedImage image = new BufferedImage(320, 180, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = image.createGraphics();
            g2d.setColor(Color.DARK_GRAY);
            g2d.fillRect(0, 0, 320, 180);
            g2d.setColor(Color.WHITE);
            g2d.setFont(new java.awt.Font("Arial", java.awt.Font.BOLD, 18));
            g2d.drawString("Video Preview", 100, 90);
            g2d.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "png", baos);
            return baos.toByteArray();
        } catch (IOException e) {
            e.printStackTrace();
            return new byte[0];
        }
    }

    private static String getExtensionFromContentType(String contentType) {
        if (contentType == null) {
            return "mp4"; // Par défaut général
        }

        String lowerContentType = contentType.toLowerCase();

        // Types audio
        switch (lowerContentType) {
            // Types audio
            case "audio/mpeg":
            case "audio/mp3":
                return "mp3";
            case "audio/wav":
            case "audio/x-wav":
                return "wav";
            case "audio/mp4":
            case "audio/x-m4a":
                return "m4a";
            case "audio/ogg":
                return "ogg";

            // Types vidéo
            case "video/mp4":
                return "mp4";
            case "video/mpeg":
                return "mpg";
            case "video/x-ms-wmv":
                return "wmv";
            case "video/quicktime":
                return "mov";
            case "video/x-matroska":
                return "mkv";
            case "video/webm":
                return "webm";
            case "video/x-flv":
                return "flv";
            case "video/3gpp":
                return "3gp";
            case "video/avi":
            case "video/x-msvideo":
                return "avi";

            default:
                // Déterminer le type de média par préfixe
                if (lowerContentType.startsWith("audio/")) {
                    System.out.println("Type audio non reconnu: " + contentType + ", utilisation de .mp3 par défaut");
                    return "mp3";
                } else if (lowerContentType.startsWith("video/")) {
                    System.out.println("Type vidéo non reconnu: " + contentType + ", utilisation de .mp4 par défaut");
                    return "mp4";
                } else {
                    System.out.println("Type de média non reconnu: " + contentType);
                    return null; // Retourner null pour les types non reconnus
                }
        }
    }
}