package fr.cgi.magneto.controller;

import fr.cgi.magneto.service.ServiceFactory;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Get;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.http.HttpServerResponse;

import org.entcore.common.controller.ControllerHelper;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.apache.poi.xslf.usermodel.XSLFTextBox;

import java.io.ByteArrayOutputStream;
import io.vertx.core.buffer.Buffer;

public class PingController extends ControllerHelper {

    public PingController(ServiceFactory serviceFactory) {
    }

    private String generateFileName() {
        return "magneto_" + System.currentTimeMillis();
    }

    @Get("/ping")
    @ApiDoc("Test endpoint that creates a PPTX file")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void ping(HttpServerRequest request) {
        try {
            @SuppressWarnings("resource")
            XMLSlideShow pptx = new XMLSlideShow();
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            // Création d'une slide
            XSLFSlide slide = pptx.createSlide();

            // Ajout d'un titre
            XSLFTextBox title = slide.createTextBox();
            title.setText("Hello from Magneto!");

            // Positionner le texte
            title.setAnchor(new java.awt.Rectangle(50, 50, 400, 100));

            // Personnaliser la police
            title.getTextParagraphs().get(0).getTextRuns().get(0).setFontSize(44.0);
            title.getTextParagraphs().get(0).getTextRuns().get(0).setFontFamily("Arial");

            // Écrire dans le ByteArrayOutputStream
            pptx.write(out);

            // Envoyer le fichier en réponse
            HttpServerResponse response = request.response();
            response.putHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
            response.putHeader("Content-Disposition", "attachment; filename=\"magneto_1737398949947.pptx\"");
            response.end(Buffer.buffer(out.toByteArray()));

        } catch (Exception e) {
            log.error("Error creating PowerPoint", e);
            renderError(request);
        }
    }

}
