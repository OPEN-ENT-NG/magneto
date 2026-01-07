package fr.cgi.magneto.service.impl;

import fr.cgi.magneto.core.constants.CollectionsConstant;
import fr.cgi.magneto.core.constants.Field;
import fr.cgi.magneto.helper.LogHelper;
import fr.cgi.magneto.service.ImageService;
import fr.cgi.magneto.service.ServiceFactory;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.buffer.Buffer;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.web.client.HttpResponse;
import org.apache.commons.io.IOUtils;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

import static fr.cgi.magneto.core.constants.CollectionsConstant.MAX_IMAGES_PER_DESCRIPTION;

public class DefaultImageService implements ImageService {

    private static final Logger log = LoggerFactory.getLogger(DefaultImageService.class);
    private final ServiceFactory serviceFactory;

    public DefaultImageService(ServiceFactory serviceFactory) {
        this.serviceFactory = serviceFactory;
    }

    /**
     * Traite le contenu HTML pour convertir les images en base64
     */
    public Future<String> processHtmlImages(String htmlContent, List<Map<String, Object>> documents) {
        if (htmlContent == null || htmlContent.isEmpty()) {
            return Future.succeededFuture(htmlContent);
        }

        log.debug("[Magneto@DefaultImageService::processHtmlImages] Processing HTML content, length: " + htmlContent.length());

        Promise<String> promise = Promise.promise();
        List<String> imageUrls = extractImageUrls(htmlContent);
        List<Future<Void>> imageFutures = new ArrayList<>();
        Map<String, String> urlToBase64 = new HashMap<>();

        int processedImageCount = 0;

        for (String imgUrl : imageUrls) {
            if (processedImageCount >= MAX_IMAGES_PER_DESCRIPTION) {
                log.warn("[Magneto@DefaultImageService::processHtmlImages] Max images limit reached");
                break;
            }

            if (imgUrl.startsWith("data:")) {
                log.debug("[Magneto@DefaultImageService::processHtmlImages] Image already in base64, skipping");
                continue;
            }

            if (urlToBase64.containsKey(imgUrl)) {
                log.debug("[Magneto@DefaultImageService::processHtmlImages] Image already processed, skipping");
                continue;
            }

            processedImageCount++;

            if (imgUrl.contains("/workspace/document/")) {
                imageFutures.add(processWorkspaceImage(imgUrl, documents, urlToBase64));
            } else if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://") || imgUrl.startsWith("//")) {
                imageFutures.add(processExternalImage(imgUrl, urlToBase64));
            } else {
                log.warn("[Magneto@DefaultImageService::processHtmlImages] Unknown image URL format: " + imgUrl);
            }
        }

        if (imageFutures.isEmpty()) {
            promise.complete(htmlContent);
        } else {
            Future.all(imageFutures)
                    .onSuccess(v -> promise.complete(replaceImageUrls(htmlContent, urlToBase64)))
                    .onFailure(err -> {
                        String message = "Failed to process all images";
                        LogHelper.logError(this, "processHtmlImages", message, err.getMessage());
                        promise.fail(err);
                    });
        }

        return promise.future();
    }

    /**
     * Extrait toutes les URLs d'images du contenu HTML
     */
    private List<String> extractImageUrls(String htmlContent) {
        List<String> imageUrls = new ArrayList<>();
        Pattern imgPattern = Pattern.compile("<img[^>]*?src=[\"']([^\"']+)[\"'][^>]*?>", Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = imgPattern.matcher(htmlContent);

        while (matcher.find()) {
            imageUrls.add(matcher.group(1));
        }

        return imageUrls;
    }

    /**
     * Traite une image du workspace et retourne son contenu en base64
     */
    private Future<Void> processWorkspaceImage(String imgUrl, List<Map<String, Object>> documents,
                                               Map<String, String> urlToBase64) {
        Promise<Void> promise = Promise.promise();

        String documentId = imgUrl.substring(imgUrl.lastIndexOf('/') + 1);

        if (documentId.contains("?")) {
            documentId = documentId.substring(0, documentId.indexOf("?"));
        }

        String base64 = getDocumentAsBase64(documentId, documents);
        if (!base64.isEmpty()) {
            urlToBase64.put(imgUrl, base64);
        } else {
            log.warn("[Magneto@DefaultImageService::processWorkspaceImage] Workspace image not found in documents");
        }

        promise.complete();
        return promise.future();
    }

    /**
     * Traite une image externe en la téléchargeant et la convertissant en base64
     */
    private Future<Void> processExternalImage(String imgUrl, Map<String, String> urlToBase64) {
        Promise<Void> promise = Promise.promise();

        String fullUrl = imgUrl;
        if (imgUrl.startsWith("//")) {
            fullUrl = "https:" + imgUrl;
        }

        downloadAndConvertImageToBase64(fullUrl)
                .onSuccess(base64 -> {
                    if (base64 != null && !base64.isEmpty()) {
                        urlToBase64.put(imgUrl, base64);
                    }
                    promise.complete();
                })
                .onFailure(err -> {
                    promise.complete();
                });

        return promise.future();
    }

    /**
     * Remplace les URLs d'images dans le HTML par leurs versions base64
     */
    private String replaceImageUrls(String htmlContent, Map<String, String> urlToBase64) {
        String processedHtml = htmlContent;

        for (Map.Entry<String, String> entry : urlToBase64.entrySet()) {
            String oldUrl = entry.getKey();
            String newUrl = entry.getValue();

            processedHtml = processedHtml.replace(
                    "src=\"" + oldUrl + "\"",
                    "src=\"" + newUrl + "\""
            );

            processedHtml = processedHtml.replace(
                    "src='" + oldUrl + "'",
                    "src='" + newUrl + "'"
            );
        }

        return processedHtml;
    }

    private Future<String> downloadAndConvertImageToBase64(String imageUrl) {
        Promise<String> promise = Promise.promise();

        try {
            serviceFactory.webClient().getAbs(imageUrl)
                    .timeout(10000)
                    .putHeader("User-Agent", "Mozilla/5.0 (compatible; MagnetoBot/1.0)")
                    .send()
                    .compose(response -> handleImageResponse(response, imageUrl))
                    .onSuccess(promise::complete)
                    .onFailure(err -> {
                        String message = String.format("Request failed: %s", imageUrl);
                        LogHelper.logError(this, "downloadAndConvertImageToBase64", message, err.getMessage());
                        promise.complete("");
                    });

        } catch (Exception e) {
            String message = String.format("Invalid URL: %s", imageUrl);
            LogHelper.logError(this, "downloadAndConvertImageToBase64", message, e.getMessage());
            promise.complete("");
        }

        return promise.future();
    }

    /**
     * Gère la réponse HTTP et convertit l'image en base64
     */
    private Future<String> handleImageResponse(HttpResponse<Buffer> response,
                                               String imageUrl) {
        if (response.statusCode() == 301 || response.statusCode() == 302) {
            //Redirection, on prend donc l'url de cette dernière pour chercher l'image
            String location = response.getHeader("Location");
            if (location != null) {
                return downloadAndConvertImageToBase64(location);
            }
        }

        if (response.statusCode() != 200) {
            log.warn("[Magneto@DefaultImageService::handleImageResponse] Bad status code " + response.statusCode() + " for: " + imageUrl);
            return Future.succeededFuture("");
        }

        String contentType = response.getHeader("Content-Type");
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("[Magneto@DefaultImageService::handleImageResponse] Not an image, content-type: " + contentType + " for: " + imageUrl);
            return Future.succeededFuture("");
        }

        return convertBufferToBase64(response.body(), contentType, imageUrl);
    }

    /**
     * Convertit le buffer de l'image en base64
     */
    private Future<String> convertBufferToBase64(Buffer buffer, String contentType, String imageUrl) {
        try {
            if (buffer.length() > 1024 * 1024) {
                log.warn("[Magneto@DefaultImageService::convertBufferToBase64] Image too large: " + imageUrl);
                return Future.succeededFuture("");
            }

            String base64 = Base64.getEncoder().encodeToString(buffer.getBytes());
            String dataUrl = "data:" + contentType + ";base64," + base64;
            return Future.succeededFuture(dataUrl);
        } catch (Exception e) {
            String message = "Error processing response";
            LogHelper.logError(this, "convertBufferToBase64", message, e.getMessage());
            return Future.succeededFuture("");
        }
    }

    /**
     * Récupère un document et le convertit en base64 avec son content-type
     */
    public String getDocumentAsBase64(String documentId, List<Map<String, Object>> documents) {
        if (documentId == null || documents == null) {
            return "";
        }

        for (Map<String, Object> doc : documents) {
            if (documentId.equals(doc.get(Field.DOCUMENT_ID))) {
                Buffer buffer = (Buffer) doc.get(Field.BUFFER);
                String contentType = (String) doc.get(Field.CONTENTTYPE);

                if (buffer != null) {
                    String base64 = Base64.getEncoder().encodeToString(buffer.getBytes());
                    return CollectionsConstant.DATA_PREFIX + (contentType != null ? contentType : CollectionsConstant.DEFAULT_CONTENT_TYPE) + CollectionsConstant.BASE64_SUFFIX + base64;
                }
            }
        }

        return "";
    }

    public String loadSvgAsBase64(String iconName) {
        try (InputStream is = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(CollectionsConstant.IMG_RESOURCES_PATH + iconName + CollectionsConstant.SVG_EXTENSION)) {
            if (is == null) {
                return "";
            }
            byte[] bytes = IOUtils.toByteArray(is);
            String base64 = Base64.getEncoder().encodeToString(bytes);
            return CollectionsConstant.DATA_IMAGE_SVG_BASE64 + base64;
        } catch (IOException e) {
            log.error("[Magneto@DefaultPDFExportService::loadSvgAsBase64] Failed to load SVG icon: " + iconName, e);
            return "";
        }
    }
}