import { FILE_EXTENSION } from "~/core/enums/file-extension.enum";

const FILE_EXTENSION_DESCRIPTIONS: Record<FILE_EXTENSION, string> = {
  [FILE_EXTENSION.DOC]: "Document Word (.doc)",
  [FILE_EXTENSION.DOCX]: "Document Word (.docx)",
  [FILE_EXTENSION.ODT]: "Document texte OpenDocument (.odt)",
  [FILE_EXTENSION.RTF]: "Fichier RTF (.rtf)",
  [FILE_EXTENSION.TEX]: "Document LaTeX (.tex)",
  [FILE_EXTENSION.TXT]: "Fichier texte (.txt)",
  [FILE_EXTENSION.WPD]: "Document WordPerfect (.wpd)",
  [FILE_EXTENSION.MD]: "Fichier MD (.md)",
  [FILE_EXTENSION.TIF]: "Image TIF (.tif)",
  [FILE_EXTENSION.TIFF]: "Image TIFF (.tiff)",
  [FILE_EXTENSION.BMP]: "Image BitMaP (.bmp)",
  [FILE_EXTENSION.GIF]: "Fichier GIF (.gif)",
  [FILE_EXTENSION.JPG]: "Image JPG (.jpg)",
  [FILE_EXTENSION.JPEG]: "Image JPEG (.jpeg)",
  [FILE_EXTENSION.PNG]: "Image PNG (.png)",
  [FILE_EXTENSION.EPS]: "Image PostScript (.eps)",
  [FILE_EXTENSION.RAW]: "Image RAW (.raw)",
  [FILE_EXTENSION.THREE_G2]: "Vidéo 3G2 (.3g2)",
  [FILE_EXTENSION.THREE_GP]: "Vidéo 3GP (.3gp)",
  [FILE_EXTENSION.AVI]: "Vidéo AVI (.avi)",
  [FILE_EXTENSION.FLV]: "Vidéo Flash (.flv)",
  [FILE_EXTENSION.H264]: "Vidéo H.264 (.h264)",
  [FILE_EXTENSION.M4V]: "Vidéo iTunes (.m4v)",
  [FILE_EXTENSION.MKV]: "Vidéo Matroska (.mkv)",
  [FILE_EXTENSION.MOV]: "Vidéo Apple QuickTime (.mov)",
  [FILE_EXTENSION.MP4]: "Vidéo MPEG 4 (.mp4)",
  [FILE_EXTENSION.MPG]: "Vidéo MPG (.mpg)",
  [FILE_EXTENSION.MPEG]: "Vidéo MPEG (.mpeg)",
  [FILE_EXTENSION.RM]: "Vidéo RealMedia (.rm)",
  [FILE_EXTENSION.SWF]: "Vidéo Shockwave Flash (.swf)",
  [FILE_EXTENSION.VOB]: "Fichier d'objet vidéo (.vob)",
  [FILE_EXTENSION.WMV]: "Vidéo Windows Media (.wmv)",
  [FILE_EXTENSION.AIF]: "Audio AIFF (.aif)",
  [FILE_EXTENSION.CDA]: "Piste de CD audio (.cda)",
  [FILE_EXTENSION.MID]: "Fichier d'interface Musical Instrument Digital (.mid)",
  [FILE_EXTENSION.MIDI]:
    "Fichier d'interface Musical Instrument Digital (.midi)",
  [FILE_EXTENSION.MP3]: "Audio MP3 (.mp3)",
  [FILE_EXTENSION.MPA]: "Audio MPEG-2 (.mpa)",
  [FILE_EXTENSION.OGG]: "Audio OGG (.ogg)",
  [FILE_EXTENSION.WAV]: "Audio Wave (.wav)",
  [FILE_EXTENSION.WMA]: "Audio Windows Media (.wma)",
  [FILE_EXTENSION.WPL]: "Liste audio (.wpl)",
  [FILE_EXTENSION.XLSX]: "Classeur Excel (.xlsx)",
  [FILE_EXTENSION.XLSM]: "Classeur Excel (avec macros) (.xlsm)",
  [FILE_EXTENSION.XLT]: "Modèle Excel (.xlt)",
  [FILE_EXTENSION.XLTX]: "Modèle Excel (.xltx)",
  [FILE_EXTENSION.XLTM]: "Modèle Excel (avec macros) (.xltm)",
  [FILE_EXTENSION.ODS]: "Feuille de calcul OpenDocument (.ods)",
  [FILE_EXTENSION.CSV]: "Fichier CSV (.csv)",
  [FILE_EXTENSION.TSV]: "Fichier TSV (.tsv)",
  [FILE_EXTENSION.TAB]: "Fichier TAB (.tab)",
  [FILE_EXTENSION.PDF]: "Fichier PDF (.pdf)",
};

export function useFileExtensionDescription(
  extension: string | FILE_EXTENSION,
): string {
  const normalizedExtension = extension.toLowerCase() as FILE_EXTENSION;

  return (
    FILE_EXTENSION_DESCRIPTIONS[normalizedExtension] ||
    `Fichier ${normalizedExtension.toUpperCase()} (*.${normalizedExtension})`
  );
}
