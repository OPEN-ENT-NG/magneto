package fr.cgi.magneto.core.constants;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FileFormatConstants {

    public static final String FORMAT_TEXT = "TEXT";
    public static final String FORMAT_IMAGE = "IMAGE";
    public static final String FORMAT_VIDEO = "VIDEO";
    public static final String FORMAT_AUDIO = "AUDIO";
    public static final String FORMAT_SHEET = "SHEET";
    public static final String FORMAT_PDF = "PDF";
    public static final String FORMAT_DEFAULT = "DEFAULT";

    private static final Map<String, List<String>> FORMAT_EXTENSIONS = new HashMap<>();

    static {
        FORMAT_EXTENSIONS.put(FORMAT_TEXT, Arrays.asList(
                "doc", "docx", "odt", "rtf", "tex", "txt", "wpd", "md"
        ));

        FORMAT_EXTENSIONS.put(FORMAT_IMAGE, Arrays.asList(
                "tif", "tiff", "bmp", "gif", "jpg", "jpeg", "png", "eps", "raw"
        ));

        FORMAT_EXTENSIONS.put(FORMAT_VIDEO, Arrays.asList(
                "3g2", "3gp", "avi", "flv", "h264", "m4v", "mkv", "mov",
                "mp4", "mpg", "mpeg", "rm", "swf", "vob", "wmv"
        ));

        FORMAT_EXTENSIONS.put(FORMAT_AUDIO, Arrays.asList(
                "aif", "cda", "mid", "midi", "mp3", "mpa", "ogg", "wav", "wma", "wpl"
        ));

        FORMAT_EXTENSIONS.put(FORMAT_SHEET, Arrays.asList(
                "xlsx", "xls", "xlsm", "xlt", "xltx", "xltm", "ods", "csv", "tsv", "tab"
        ));

        FORMAT_EXTENSIONS.put(FORMAT_PDF, Arrays.asList(
                "pdf"
        ));
    }

    /**
     * Détermine le format basé sur l'extension de fichier
     */
    public static String getFormatFromExtension(String extension) {
        if (extension == null || extension.isEmpty()) {
            return FORMAT_DEFAULT;
        }

        String lowerExt = extension.toLowerCase();

        return FORMAT_EXTENSIONS.entrySet().stream()
                .filter(entry -> entry.getValue().contains(lowerExt))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse(FORMAT_DEFAULT);
    }

    /**
     * Extrait l'extension d'un nom de fichier
     */
    public static String extractExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }

        int lastDot = filename.lastIndexOf('.');
        if (lastDot > 0 && lastDot < filename.length() - 1) {
            return filename.substring(lastDot + 1);
        }

        return "";
    }

    /**
     * Détermine le type de format basé sur l'extension du fichier
     */
    public static String getFileFormat(String extension) {
        //String extension = extractExtension(filename);
        return getFormatFromExtension(extension);
    }
}
