package fr.cgi.magneto.model.slides;

import fr.cgi.magneto.core.constants.Slideshow;
import fr.cgi.magneto.helper.SlideHelper;
import org.apache.poi.sl.usermodel.AutoNumberingScheme;
import org.apache.poi.sl.usermodel.TextParagraph;
import org.apache.poi.xslf.usermodel.*;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;

import java.awt.*;

public class SlideText extends Slide {

    public SlideText(String title, String description) {
        this.title = title;
        this.description = description;
    }

    @Override
    public Object createApacheSlide(XSLFSlide newSlide) {

        SlideHelper.createTitle(newSlide, title, Slideshow.TITLE_HEIGHT, Slideshow.TITLE_FONT_SIZE,
                TextParagraph.TextAlign.LEFT);
        XSLFTextBox contentBox = SlideHelper.createContent(newSlide);

        Document doc = Jsoup.parse(description);
        processHtmlContent(contentBox, doc.body());

        return newSlide;
    }

    private void processHtmlContent(XSLFTextBox textBox, Element element) {
        if (textBox.getTextParagraphs().isEmpty()) {
            textBox.addNewTextParagraph();
        }

        for (Node node : element.childNodes()) {
            if (node instanceof Element) {
                Element elem = (Element) node;
                XSLFTextParagraph para = textBox.addNewTextParagraph();
                XSLFTextRun run = para.addNewTextRun();

                processStyle(elem, para, run);

                String text = elem.text().trim();
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
                    case Slideshow.CSS_COLOR:
                        try {
                            run.setFontColor(Color.decode(value));
                        } catch (NumberFormatException ignored) {
                        }
                        break;
                    case Slideshow.CSS_FONT_SIZE:
                        try {
                            String size = value.replaceAll("[^0-9]", "");
                            run.setFontSize(Double.parseDouble(size));
                        } catch (NumberFormatException ignored) {
                        }
                        break;
                    case Slideshow.CSS_TEXT_DECORATION:
                        if (value.contains(Slideshow.VALUE_UNDERLINE)) {
                            run.setUnderlined(true);
                        }
                        break;
                    case Slideshow.CSS_FONT_WEIGHT:
                        if (value.equals(Slideshow.VALUE_BOLD) || value.equals(Slideshow.VALUE_BOLD_WEIGHT)) {
                            run.setBold(true);
                        }
                        break;
                    case Slideshow.CSS_FONT_STYLE:
                        if (value.equals(Slideshow.VALUE_ITALIC)) {
                            run.setItalic(true);
                        }
                        break;
                }
            }
        }
    }

    private void processStyle(Element elem, XSLFTextParagraph para, XSLFTextRun run) {
        switch (elem.tagName().toLowerCase()) {
            case Slideshow.TAG_H1:
                run.setFontSize(Slideshow.H1_FONT_SIZE);
                run.setBold(true);
                para.setIndentLevel(Slideshow.H1_INDENT_LEVEL);
                break;
            case Slideshow.TAG_H2:
                run.setFontSize(Slideshow.H2_FONT_SIZE);
                run.setBold(true);
                para.setIndentLevel(Slideshow.H2_INDENT_LEVEL);
                break;
            case Slideshow.TAG_H3:
                run.setFontSize(Slideshow.H3_FONT_SIZE);
                run.setBold(true);
                para.setIndentLevel(Slideshow.H3_INDENT_LEVEL);
                break;
            case Slideshow.TAG_BOLD:
            case Slideshow.TAG_STRONG:
                run.setBold(true);
                break;
            case Slideshow.TAG_ITALIC:
            case Slideshow.TAG_EM:
                run.setItalic(true);
                break;
            case Slideshow.TAG_UNDERLINE:
                run.setUnderlined(true);
                break;
            case Slideshow.TAG_PARAGRAPH:
                para.setSpaceBefore(Slideshow.PARAGRAPH_SPACE_BEFORE);
                para.setSpaceAfter(Slideshow.PARAGRAPH_SPACE_AFTER);
                break;
            case Slideshow.TAG_UNORDERED_LIST:
                para.setIndentLevel(Slideshow.LIST_INDENT_LEVEL);
                para.setBullet(true);
                break;
            case Slideshow.TAG_ORDERED_LIST:
                para.setIndentLevel(Slideshow.LIST_INDENT_LEVEL);
                para.setBulletAutoNumber(AutoNumberingScheme.arabicPeriod, 1);
                break;
            case Slideshow.TAG_LIST_ITEM:
                para.setIndentLevel(Slideshow.LIST_INDENT_LEVEL);
                break;
        }
        String style = elem.attr(Slideshow.CSS_STYLE);
        if (!style.isEmpty()) {
            processInlineStyles(run, style);
        }
    }
}