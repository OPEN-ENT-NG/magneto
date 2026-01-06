package fr.cgi.magneto.service;

import io.vertx.core.Future;

import java.util.List;
import java.util.Map;

public interface ImageService {
    /**
     * Parse and set all images in html content
     *
     * @param htmlContent the html content to parse
     * @param documents List of documents
     * @return Future {@link Future < String >} with the updated html content
     */
    Future<String> processHtmlImages(String htmlContent, List<Map<String, Object>> documents);

    /**
     * Convert document to base64 format
     *
     * @param documentId documentId
     * @param documents List of documents
     * @return {@link String} the base64 code of the converted document
     */
    String getDocumentAsBase64(String documentId, List<Map<String, Object>> documents);
}
