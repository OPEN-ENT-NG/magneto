package fr.cgi.magneto.model.slides;

import java.awt.Color;
import java.awt.Rectangle;

import org.apache.poi.sl.usermodel.TextParagraph.TextAlign;
import org.apache.poi.sl.usermodel.AutoNumberingScheme;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;
import org.apache.poi.xslf.usermodel.XSLFTextParagraph;
import org.apache.poi.xslf.usermodel.XSLFTextRun;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;

import fr.cgi.magneto.helper.SlideHelper;

public class SlideText extends Slide {
    private final String title;
    private final String description;

    public SlideText(String title, String description) {
        this.title = title;
        this.description = description;
    }

    @Override
    public Object createApacheSlide() {
        // Créer un nouveau slide
        XMLSlideShow ppt = new XMLSlideShow();
        XSLFSlide slide = ppt.createSlide();

        // Ajouter le titre
        SlideHelper.createTitle(slide, title);
        // Créer une zone de texte pour le contenu principal
        XSLFTextBox contentBox = SlideHelper.createContent(slide);

        // Parser le HTML
        Document doc = Jsoup.parse(description);
        processHtmlContent(contentBox, doc.body());

        return slide;
    }

    private void processHtmlContent(XSLFTextBox textBox, Element element) {
        // Créer un paragraphe initial si nécessaire
        if (textBox.getTextParagraphs().isEmpty()) {
            textBox.addNewTextParagraph();
        }
    
        for (Node node : element.childNodes()) {
            if (node instanceof Element) {
                Element elem = (Element) node;
                XSLFTextParagraph para = textBox.addNewTextParagraph();
                XSLFTextRun run = para.addNewTextRun();
    
                // Appliquer les styles
                processStyle(elem, para, run);
    
                // Récupérer le texte de l'élément
                String text = elem.text().trim(); // On utilise text() au lieu de ownText()
                if (!text.isEmpty()) {
                    run.setText(text);
                }
            }
        }
    }

    private void processInlineStyles(XSLFTextRun run, String style) {
        String[] styles = style.split(";");
        for (String s : styles) {
            String[] parts = s.split(":");
            if (parts.length == 2) {
                String property = parts[0].trim();
                String value = parts[1].trim();

                switch (property) {
                    case "color":
                        try {
                            run.setFontColor(Color.decode(value));
                        } catch (NumberFormatException ignored) {
                        }
                        break;
                    case "font-size":
                        try {
                            String size = value.replaceAll("[^0-9]", "");
                            run.setFontSize(Double.parseDouble(size));
                        } catch (NumberFormatException ignored) {
                        }
                        break;
                    case "text-decoration":
                        if (value.contains("underline")) {
                            run.setUnderlined(true);
                        }
                        break;
                    case "font-weight":
                        if (value.equals("bold") || value.equals("700")) {
                            run.setBold(true);
                        }
                        break;
                    case "font-style":
                        if (value.equals("italic")) {
                            run.setItalic(true);
                        }
                        break;
                }
            }
        }
    }

    private void processStyle(Element elem, XSLFTextParagraph para, XSLFTextRun run) {
        switch (elem.tagName().toLowerCase()) {
            case "h1":
                run.setFontSize(20.0);
                run.setBold(true);
                para.setIndentLevel(0);
                break;
            case "h2":
                run.setFontSize(18.0);
                run.setBold(true);
                para.setIndentLevel(1);
                break;
            case "h3":
                run.setFontSize(16.0);
                run.setBold(true);
                para.setIndentLevel(2);
                break;
            case "b":
            case "strong":
                run.setBold(true);
                break;
            case "i":
            case "em":
                run.setItalic(true);
                break;
            case "u":
                run.setUnderlined(true);
                break;
            case "p":
                para.setSpaceBefore(10.0);
                para.setSpaceAfter(10.0);
                break;
            case "ul":
                para.setIndentLevel(1);
                para.setBullet(true);
                break;
            case "ol":
                para.setIndentLevel(1);
                para.setBulletAutoNumber(AutoNumberingScheme.arabicPeriod, 1);
                break;
            case "li":
                para.setIndentLevel(1);
                break;
        }
        String style = elem.attr("style");
        if (!style.isEmpty()) {
            processInlineStyles(run, style);
        }
    }
}