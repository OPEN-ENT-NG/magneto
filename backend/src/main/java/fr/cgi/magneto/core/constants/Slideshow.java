package fr.cgi.magneto.core.constants;

import java.awt.Color;

public class Slideshow {
    // Constantes de mise en page générales
    public static final int MARGIN_LEFT = 140;
    public static final int MARGIN_TOP_TITLE = 40;
    public static final int WIDTH = 1000;
    public static final String DEFAULT_FONT = "Roboto";
    public static final int SLIDE_HEIGHT = 720;
    public static final int SLIDE_WIDTH = 1280;

    // Constantes pour les titres
    public static final int TITLE_HEIGHT = 70;
    public static final Double TITLE_FONT_SIZE = 44.0;
    public static final int DESCRIPTION_TITLE_HEIGHT = 75;
    public static final Double DESCRIPTION_TITLE_FONT_SIZE = 55.0;
    public static final int MAIN_TITLE_HEIGHT = 100;
    public static final Double MAIN_TITLE_FONT_SIZE = 100.0;

    // Constantes pour les légendes
    public static final int LEGEND_HEIGHT = 70;
    public static final int LEGEND_MARGIN_BOTTOM = 20;
    public static final Double LEGEND_FONT_SIZE = 16.0;
    public static final String LEGEND_FONT_FAMILY = "Roboto";

    // Constantes pour le contenu
    public static final int CONTENT_HEIGHT = 520;
    public static final int CONTENT_MARGIN_TOP = 140;
    public static final int MAIN_CONTENT_MARGIN_TOP = 300;
    public static final Double CONTENT_FONT_SIZE = 36.0;
    public static final Double DESCRIPTION_FONT_SIZE = 24.0;

    // Constantes pour les images
    public static final int MAIN_IMAGE_CONTENT_HEIGHT = 400;
    public static final int IMAGE_CONTENT_HEIGHT = 480;

    // Constantes content_type prefixes
    public static final String CONTENT_TYPE_AUDIO = "audio/";
    public static final String CONTENT_TYPE_VIDEO = "video/";

    // Constantes content_type audio
    public static final String CONTENT_TYPE_AUDIO_MPEG = "audio/mpeg";
    public static final String CONTENT_TYPE_AUDIO_MP3 = "audio/mp3";
    public static final String CONTENT_TYPE_AUDIO_WAV = "audio/wav";
    public static final String CONTENT_TYPE_AUDIO_X_WAV = "audio/x-wav";
    public static final String CONTENT_TYPE_AUDIO_MP4 = "audio/mp4";
    public static final String CONTENT_TYPE_AUDIO_X_M4A = "audio/x-m4a";
    public static final String CONTENT_TYPE_AUDIO_OGG = "audio/ogg";

    // Constantes content_type vidéo
    public static final String CONTENT_TYPE_VIDEO_MP4 = "video/mp4";
    public static final String CONTENT_TYPE_VIDEO_MPEG = "video/mpeg";
    public static final String CONTENT_TYPE_VIDEO_X_MS_WMV = "video/x-ms-wmv";
    public static final String CONTENT_TYPE_VIDEO_QUICKTIME = "video/quicktime";
    public static final String CONTENT_TYPE_VIDEO_X_MATROSKA = "video/x-matroska";
    public static final String CONTENT_TYPE_VIDEO_WEBM = "video/webm";
    public static final String CONTENT_TYPE_VIDEO_X_FLV = "video/x-flv";
    public static final String CONTENT_TYPE_VIDEO_3GPP = "video/3gpp";
    public static final String CONTENT_TYPE_VIDEO_AVI = "video/avi";
    public static final String CONTENT_TYPE_VIDEO_X_MSVIDEO = "video/x-msvideo";

    // Constantes content_type image
    public static final String CONTENT_TYPE_IMAGE_JPEG = "image/jpeg";
    public static final String CONTENT_TYPE_IMAGE_JPG = "image/jpg";
    public static final String CONTENT_TYPE_IMAGE_PNG = "image/png";
    public static final String CONTENT_TYPE_IMAGE_GIF = "image/gif";
    public static final String CONTENT_TYPE_IMAGE_TIFF = "image/tiff";
    public static final String CONTENT_TYPE_IMAGE_X_EMF = "image/x-emf";
    public static final String CONTENT_TYPE_IMAGE_X_WMF = "image/x-wmf";
    public static final String CONTENT_TYPE_IMAGE_X_PICT = "image/x-pict";
    public static final String CONTENT_TYPE_IMAGE_DIB = "image/dib";
    public static final String CONTENT_TYPE_IMAGE_X_EPS = "image/x-eps";
    public static final String CONTENT_TYPE_IMAGE_X_MS_BMP = "image/x-ms-bmp";
    public static final String CONTENT_TYPE_IMAGE_BMP = "image/bmp";
    public static final String CONTENT_TYPE_IMAGE_X_WPG = "image/x-wpg";
    public static final String CONTENT_TYPE_IMAGE_VND_MS_PHOTO = "image/vnd.ms-photo";
    public static final String CONTENT_TYPE_IMAGE_SVG_XML = "image/svg+xml";
    public static final String CONTENT_TYPE_IMAGE_PREFIX = "image/";

    // Constantes pour le formatage de texte
    public static final Double H1_FONT_SIZE = 20.0;
    public static final Double H2_FONT_SIZE = 18.0;
    public static final Double H3_FONT_SIZE = 16.0;
    public static final int H1_INDENT_LEVEL = 0;
    public static final int H2_INDENT_LEVEL = 1;
    public static final int H3_INDENT_LEVEL = 2;
    public static final int LIST_INDENT_LEVEL = 1;

    // Constantes pour l'espacement des paragraphes
    public static final Double PARAGRAPH_SPACE_BEFORE = 10.0;
    public static final Double PARAGRAPH_SPACE_AFTER = 10.0;

    // Constantes pour les styles CSS
    public static final String CSS_STYLE = "style";
    public static final String CSS_COLOR = "color";
    public static final String CSS_FONT_SIZE = "font-size";
    public static final String CSS_TEXT_DECORATION = "text-decoration";
    public static final String CSS_FONT_WEIGHT = "font-weight";
    public static final String CSS_FONT_STYLE = "font-style";

    // Constantes pour les valeurs de style
    public static final String VALUE_UNDERLINE = "underline";
    public static final String VALUE_BOLD = "bold";
    public static final String VALUE_BOLD_WEIGHT = "700";
    public static final String VALUE_ITALIC = "italic";

    // Constantes pour les préfixes de noms de fichiers médias
    public static final String MEDIA_TYPE_AUDIO = "audio";
    public static final String MEDIA_TYPE_VIDEO = "video";

    // Constantes pour les chemins et relations
    public static final String MEDIA_PATH_PREFIX = "/ppt/media/";
    public static final String RELATIONSHIP_MEDIA = "http://schemas.microsoft.com/office/2007/relationships/media";
    public static final String RELATIONSHIP_AUDIO = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio";
    public static final String RELATIONSHIP_VIDEO = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/video";
    public static final String ACTION_MEDIA = "ppaction://media";
    public static final String EXTENSION_URI_MEDIA = "{DAA4B4D4-6D71-4841-9C94-3DE7FCFB9230}";
    public static final String NAMESPACE_POWERPOINT_2010 = "http://schemas.microsoft.com/office/powerpoint/2010/main";

    // Constantes pour les paramètres de timing
    public static final int TIMING_ROOT_ID = 1;
    public static final int TIMING_MEDIA_ID = 2;
    public static final int MEDIA_VOLUME = 80000;

    // Constantes pour les balises HTML
    public static final String TAG_H1 = "h1";
    public static final String TAG_H2 = "h2";
    public static final String TAG_H3 = "h3";
    public static final String TAG_BOLD = "b";
    public static final String TAG_STRONG = "strong";
    public static final String TAG_ITALIC = "i";
    public static final String TAG_EM = "em";
    public static final String TAG_UNDERLINE = "u";
    public static final String TAG_PARAGRAPH = "p";
    public static final String TAG_UNORDERED_LIST = "ul";
    public static final String TAG_ORDERED_LIST = "ol";
    public static final String TAG_LIST_ITEM = "li";

    // Constantes pour les extensions de fichiers
    public static final String EXT_MP3 = "mp3";
    public static final String EXT_WAV = "wav";
    public static final String EXT_M4A = "m4a";
    public static final String EXT_OGG = "ogg";
    public static final String EXT_MP4 = "mp4";
    public static final String EXT_MPG = "mpg";
    public static final String EXT_WMV = "wmv";
    public static final String EXT_MOV = "mov";
    public static final String EXT_MKV = "mkv";
    public static final String EXT_WEBM = "webm";
    public static final String EXT_FLV = "flv";
    public static final String EXT_3GP = "3gp";
    public static final String EXT_AVI = "avi";

    // Constantes pour les valeurs par défaut
    public static final String DEFAULT_VIDEO_EXTENSION = EXT_MP4;
    public static final String DEFAULT_AUDIO_EXTENSION = EXT_MP3;

    // Constantes pour les vignettes par défaut
    public static final int THUMBNAIL_WIDTH = 320;
    public static final int THUMBNAIL_HEIGHT = 180;
    public static final String THUMBNAIL_FORMAT = "png";
    public static final String THUMBNAIL_FONT = "Arial";
    public static final int THUMBNAIL_FONT_STYLE = java.awt.Font.BOLD;
    public static final int THUMBNAIL_FONT_SIZE = 18;
    public static final String THUMBNAIL_DEFAULT_TEXT = "Video Preview";
    public static final int THUMBNAIL_TEXT_X = 100;
    public static final int THUMBNAIL_TEXT_Y = 90;
    public static final int VIDEO_THUMBNAIL_WIDTH = 640;
    public static final int VIDEO_THUMBNAIL_HEIGHT = 360;
    public static final String VIDEO_THUMBNAIL_FORMAT = "png";
    public static final String VIDEO_THUMBNAIL_FONT = "Arial";
    public static final int VIDEO_THUMBNAIL_FONT_STYLE = java.awt.Font.BOLD;
    public static final int VIDEO_THUMBNAIL_FONT_SIZE = 24;
    public static final String VIDEO_THUMBNAIL_TEXT = "VIDÉO";
    public static final int VIDEO_PLAY_BUTTON_RADIUS = 50;
    public static final int VIDEO_TEXT_Y_OFFSET = 80;
    public static final int VIDEO_PLAY_TRIANGLE_OFFSET_X = 15;
    public static final int VIDEO_PLAY_TRIANGLE_OFFSET_Y = 25;
    public static final int VIDEO_PLAY_TRIANGLE_OFFSET_X2 = 25;

    // Constantes pour les couleurs
    public static final Color VIDEO_BACKGROUND_COLOR = new Color(20, 20, 50);
    public static final Color VIDEO_PLAY_BUTTON_COLOR = new Color(255, 255, 255, 180);
    public static final Color VIDEO_TEXT_COLOR = Color.WHITE;

    // Constantes pour les dimensions d'icônes standard
    public static final int ICON_WIDTH = 150;
    public static final int ICON_HEIGHT = 150;

    // Constantes pour les dimensions vidéo standard (16:9)
    public static final int VIDEO_DISPLAY_WIDTH = 640;
    public static final int VIDEO_DISPLAY_HEIGHT = 360;

    // Constantes pour l'icône audio
    public static final int AUDIO_ICON_WIDTH = 100;
    public static final int AUDIO_ICON_HEIGHT = 100;
    public static final int AUDIO_ICON_CIRCLE_X = 5;
    public static final int AUDIO_ICON_CIRCLE_Y = 5;
    public static final int AUDIO_ICON_CIRCLE_WIDTH = 90;
    public static final int AUDIO_ICON_CIRCLE_HEIGHT = 90;
    public static final String AUDIO_ICON_FORMAT = "png";
    public static final Color AUDIO_ICON_BACKGROUND_COLOR = new Color(0, 120, 215, 240);
    public static final Color AUDIO_ICON_PLAY_COLOR = Color.WHITE;
    public static final int[] AUDIO_ICON_TRIANGLE_X = { 35, 70, 35 };
    public static final int[] AUDIO_ICON_TRIANGLE_Y = { 30, 50, 70 };
    // Constantes pour l'image de secours (bytecode PNG vide 1x1)
    public static final byte[] FALLBACK_PNG = new byte[] {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08,
            0x02, 0x00, 0x00, 0x00, (byte) 0x90, 0x77, 0x53, (byte) 0xDE, 0x00, 0x00, 0x00,
            0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, (byte) 0xD7, 0x63, (byte) 0xF8, (byte) 0xCF,
            (byte) 0xC0, 0x00, 0x00, 0x03, 0x01, 0x01, 0x00, (byte) 0x18, (byte) 0xDD, (byte) 0x8D,
            (byte) 0xB0, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, (byte) 0xAE, 0x42,
            0x60, (byte) 0x82
    };
}