package fr.cgi.magneto.helper;

import java.awt.Rectangle;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;

import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFHyperlink;
import org.apache.poi.xslf.usermodel.XSLFPictureData;
import org.apache.poi.xslf.usermodel.XSLFPictureShape;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.apache.xmlbeans.XmlObject;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackagePartName;
import org.apache.poi.openxml4j.opc.PackageRelationship;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.openxml4j.opc.TargetMode;
import org.apache.poi.sl.usermodel.Hyperlink;
import org.apache.poi.sl.usermodel.PictureData.PictureType;
import org.apache.poi.sl.usermodel.Placeholder;
import org.apache.poi.sl.usermodel.PlaceholderDetails;
import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;
import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.openxml4j.opc.PackagePart;
import org.apache.poi.openxml4j.opc.PackagePartName;
import org.apache.poi.openxml4j.opc.PackagingURIHelper;
import org.apache.poi.openxml4j.opc.TargetMode;

public class SlideHelper {
    private static final int SLIDE_HEIGHT = 720;
    private static final int SLIDE_WIDTH = 1280;
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

    public static XSLFTextBox createLegend(XSLFSlide slide, String legendText) {
        XSLFTextBox legendShape = slide.createTextBox();

        int legendY = SLIDE_HEIGHT - LEGEND_HEIGHT - LEGEND_MARGIN_BOTTOM;

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

    public static XSLFTextBox createAudio(XSLFSlide slide, byte[] audioData, String extension) {
        System.out.println("Début de la fonction createAudio");

        // Validation des paramètres d'entrée
        if (slide == null || audioData == null || audioData.length == 0 || extension == null || extension.isEmpty()) {
            System.err.println("Paramètres invalides");
            return null;
        }

        System.out.println("Taille des données audio : " + audioData.length + " octets");
        System.out.println("Extension du fichier : " + extension);

        // Déterminer le type MIME en fonction de l'extension
        String mimeType;
        switch (extension.toLowerCase()) {
            case "mp3":
                mimeType = "audio/mpeg";
                break;
            case "wav":
                mimeType = "audio/wav";
                break;
            case "m4a":
                mimeType = "audio/mp4";
                break;
            default:
                System.err.println("Format audio non supporté : " + extension);
                return null;
        }

        System.out.println("Type MIME déterminé : " + mimeType);

        // Générer un nom de fichier unique pour l'audio
        String audioFileName = "audio_" + System.currentTimeMillis() + "." + extension;
        System.out.println("Nom de fichier généré : " + audioFileName);

        try {
            // Obtenir le package OPC pour accéder au package PowerPoint
            XMLSlideShow ppt = slide.getSlideShow();
            OPCPackage opcPackage = ppt.getPackage();

            // Créer le chemin du fichier audio dans le package
            PackagePartName audioPartName = PackagingURIHelper.createPartName("/ppt/media/" + audioFileName);
            System.out.println("Chemin créé pour le fichier audio : " + audioPartName);

            // Créer la partie audio dans le package PowerPoint
            PackagePart audioPart = opcPackage.createPart(audioPartName, mimeType);
            System.out.println("Partie audio créée dans le package PowerPoint");

            // Écrire les données audio dans la partie du package
            try (OutputStream out = audioPart.getOutputStream()) {
                out.write(audioData);
            }
            System.out.println("Données audio écrites dans le fichier");

            // Créer la relation entre le slide et le fichier audio
            PackageRelationship audioRelationship = slide.getPackagePart().addRelationship(
                    audioPartName, TargetMode.INTERNAL,
                    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio");
            System.out.println("Relation audio ajoutée avec ID : " + audioRelationship.getId());

            // Créer une zone de texte pour afficher un lien vers l'audio
            XSLFTextBox audioTextBox = slide.createTextBox();
            audioTextBox.setAnchor(new Rectangle(100, 100, 200, 50)); // Position et taille de la zone de texte

            // Ajouter un paragraphe et un lien hypertexte sur le texte de la zone
            XSLFTextParagraph paragraph = audioTextBox.addNewTextParagraph();
            XSLFTextRun textRun = paragraph.addNewTextRun();
            textRun.setText("▶ Play Audio");

            // Lier le texte à la relation audio
            XSLFHyperlink hyperlink = textRun.createHyperlink();
            hyperlink.setAddress("#" + audioRelationship.getId());
            
            // Debugging
            System.out.println("DEBUG HYPERLINK:");
            System.out.println("Hyperlink Address: #" + audioRelationship.getId());
            System.out.println("Audio Filename: " + audioFileName);
            System.out.println("Audio Part Name: " + audioPartName);
            System.out.println("Relationship Type: " + audioRelationship.getRelationshipType());
            System.out.println("Target URI: " + audioRelationship.getTargetURI());
            // Sauvegarder les modifications dans le package
            opcPackage.flush();
            System.out.println("Package mis à jour avec succès");

            // Vérifier la structure du package après ajout du fichier audio
            for (PackagePart part : opcPackage.getParts()) {
                System.out.println("Partie du package : " + part.getPartName());
            }

            System.out.println("Fonction createAudio terminée avec succès");
            return audioTextBox;
        } catch (Exception e) {
            System.err.println("Erreur lors de l'ajout de l'audio : " + e.getMessage());
            e.printStackTrace();
            return null;
        }
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