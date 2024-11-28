import { useTranslation } from "react-i18next";

import { FILE_EXTENSION } from "~/core/enums/file-extension.enum";

const FILE_EXTENSION_DESCRIPTIONS: Record<FILE_EXTENSION, string> = {
  [FILE_EXTENSION.DOC]: "magneto.card.document.extension.DOC",
  [FILE_EXTENSION.DOCX]: "magneto.card.document.extension.DOCX",
  [FILE_EXTENSION.ODT]: "magneto.card.document.extension.ODT",
  [FILE_EXTENSION.RTF]: "magneto.card.document.extension.RTF",
  [FILE_EXTENSION.TEX]: "magneto.card.document.extension.TEX",
  [FILE_EXTENSION.TXT]: "magneto.card.document.extension.TXT",
  [FILE_EXTENSION.WPD]: "magneto.card.document.extension.WPD",
  [FILE_EXTENSION.MD]: "magneto.card.document.extension.MD",
  [FILE_EXTENSION.TIF]: "magneto.card.document.extension.TIF",
  [FILE_EXTENSION.TIFF]: "magneto.card.document.extension.TIFF",
  [FILE_EXTENSION.BMP]: "magneto.card.document.extension.BMP",
  [FILE_EXTENSION.GIF]: "magneto.card.document.extension.GIF",
  [FILE_EXTENSION.JPG]: "magneto.card.document.extension.JPG",
  [FILE_EXTENSION.JPEG]: "magneto.card.document.extension.JPEG",
  [FILE_EXTENSION.PNG]: "magneto.card.document.extension.PNG",
  [FILE_EXTENSION.EPS]: "magneto.card.document.extension.EPS",
  [FILE_EXTENSION.RAW]: "magneto.card.document.extension.RAW",
  [FILE_EXTENSION.THREE_G2]: "magneto.card.document.extension.THREE_G2",
  [FILE_EXTENSION.THREE_GP]: "magneto.card.document.extension.THREE_GP",
  [FILE_EXTENSION.AVI]: "magneto.card.document.extension.AVI",
  [FILE_EXTENSION.FLV]: "magneto.card.document.extension.FLV",
  [FILE_EXTENSION.H264]: "magneto.card.document.extension.H264",
  [FILE_EXTENSION.M4V]: "magneto.card.document.extension.M4V",
  [FILE_EXTENSION.MKV]: "magneto.card.document.extension.MKV",
  [FILE_EXTENSION.MOV]: "magneto.card.document.extension.MOV",
  [FILE_EXTENSION.MP4]: "magneto.card.document.extension.MP4",
  [FILE_EXTENSION.MPG]: "magneto.card.document.extension.MPG",
  [FILE_EXTENSION.MPEG]: "magneto.card.document.extension.MPEG",
  [FILE_EXTENSION.RM]: "magneto.card.document.extension.RM",
  [FILE_EXTENSION.SWF]: "magneto.card.document.extension.SWF",
  [FILE_EXTENSION.VOB]: "magneto.card.document.extension.VOB",
  [FILE_EXTENSION.WMV]: "magneto.card.document.extension.WMV",
  [FILE_EXTENSION.AIF]: "magneto.card.document.extension.AIF",
  [FILE_EXTENSION.CDA]: "magneto.card.document.extension.CDA",
  [FILE_EXTENSION.MID]: "magneto.card.document.extension.MID",
  [FILE_EXTENSION.MIDI]: "magneto.card.document.extension.MIDI",
  [FILE_EXTENSION.MP3]: "magneto.card.document.extension.MP3",
  [FILE_EXTENSION.MPA]: "magneto.card.document.extension.MPA",
  [FILE_EXTENSION.OGG]: "magneto.card.document.extension.OGG",
  [FILE_EXTENSION.WAV]: "magneto.card.document.extension.WAV",
  [FILE_EXTENSION.WMA]: "magneto.card.document.extension.WMA",
  [FILE_EXTENSION.WPL]: "magneto.card.document.extension.WPL",
  [FILE_EXTENSION.XLSX]: "magneto.card.document.extension.XLSX",
  [FILE_EXTENSION.XLSM]: "magneto.card.document.extension.XLSM",
  [FILE_EXTENSION.XLT]: "magneto.card.document.extension.XLT",
  [FILE_EXTENSION.XLTX]: "magneto.card.document.extension.XLTX",
  [FILE_EXTENSION.XLTM]: "magneto.card.document.extension.XLTM",
  [FILE_EXTENSION.ODS]: "magneto.card.document.extension.ODS",
  [FILE_EXTENSION.CSV]: "magneto.card.document.extension.CSV",
  [FILE_EXTENSION.TSV]: "magneto.card.document.extension.TSV",
  [FILE_EXTENSION.TAB]: "magneto.card.document.extension.TAB",
  [FILE_EXTENSION.PDF]: "magneto.card.document.extension.PDF",
  [FILE_EXTENSION.PPT]: "magneto.card.document.extension.PPT",
  [FILE_EXTENSION.XLS]: "magneto.card.document.extension.XLS",
};

export function useFileExtensionDescription(
  extension: string | FILE_EXTENSION,
): string {
  const normalizedExtension = extension.toLowerCase() as FILE_EXTENSION;
  const { t } = useTranslation("magneto");

  return (
    t(FILE_EXTENSION_DESCRIPTIONS[normalizedExtension]) ||
    `Fichier ${normalizedExtension.toUpperCase()} (*.${normalizedExtension})`
  );
}
