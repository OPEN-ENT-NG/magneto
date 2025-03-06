package fr.cgi.magneto.core.enums;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class FileFormatManager {

    /**
     * Obtient le type de format pour une extension donnée
     */
    public static FileFormat getFormatFromExtension(String extension) {
        return FileFormat.fromExtension(extension);
    }

    /**
     * Vérifie si une extension appartient à un format spécifique
     */
    public static boolean isExtensionOfFormat(FileFormat format, String extension) {
        return format != null && format.hasExtension(extension);
    }

    /**
     * Charge une ressource appropriée en fonction de l'extension fournie
     *
     * @param extension l'extension de fichier pour déterminer la ressource à
     *                  charger
     * @return le contenu de la ressource sous forme de byte[]
     * @throws IOException si une erreur se produit lors du chargement
     */
    public static String loadResourceForExtension(String extension) throws IOException {
        if (extension == null || extension.isEmpty()) {
            return "img/extension/default.svg";
        }

        // Déterminer le format à partir de l'extension
        FileFormat format = FileFormat.fromExtension(extension);
        if (format == null) {
            return "img/extension/default.svg";
        }
        
        // Déterminer le chemin de la ressource en fonction du format
        String resourcePath;
        switch (format) {
            case IMAGE:
                resourcePath = "img/extension/image.svg";
                break;
            case VIDEO:
                resourcePath = "img/extension/video.svg";
                break;
            case AUDIO:
                resourcePath = "img/extension/audio.svg";
                break;
            case SHEET:
                resourcePath = "img/extension/sheet.svg";
                break;
            case PDF:
                resourcePath = "img/extension/pdf.svg";
                break;
            case TEXT:
                resourcePath = "img/extension/text.svg";
                break;
            default:
                resourcePath = "img/extension/default.svg";
                break;
        }

        return resourcePath;
    }

    /**
     * Enum représentant les différents formats de fichiers
     * avec leurs extensions associées
     */
    public enum FileFormat {
        TEXT(Arrays.asList("doc", "docx", "odt", "rtf", "tex", "txt", "wpd", "md")),
        IMAGE(Arrays.asList("tif", "tiff", "bmp", "gif", "jpg", "jpeg", "png", "eps", "raw")),
        VIDEO(Arrays.asList("3g2", "3gp", "avi", "flv", "h264", "m4v", "mkv", "mov", "mp4",
                "mpg", "mpeg", "rm", "swf", "vob", "wmv")),
        AUDIO(Arrays.asList("aif", "cda", "mid", "midi", "mp3", "mpa", "ogg", "wav", "wma", "wpl")),
        SHEET(Arrays.asList("xlsx", "xls", "xlsm", "xlt", "xltx", "xltm", "ods", "csv", "tsv", "tab")),
        PDF(Arrays.asList("pdf"));

        private final List<String> extensions;

        FileFormat(List<String> extensions) {
            this.extensions = extensions;
        }

        /**
         * Trouve le format correspondant à une extension donnée
         */
        /**
         * Trouve le format correspondant à une extension donnée
         * Retourne TEXT par défaut si l'extension n'est pas reconnue
         */
        public static FileFormat fromExtension(String extension) {
            if (extension == null) {
                return FileFormat.TEXT;
            }

            String lowerExt = extension.toLowerCase();

            return Stream.of(FileFormat.values())
                    .filter(format -> format.hasExtension(lowerExt))
                    .findFirst()
                    .orElse(null);
        }

        public List<String> getExtensions() {
            return extensions;
        }

        /**
         * Vérifie si cette extension appartient à ce format
         */
        public boolean hasExtension(String extension) {
            if (extension == null) {
                return false;
            }
            return extensions.contains(extension.toLowerCase());
        }
    }

}