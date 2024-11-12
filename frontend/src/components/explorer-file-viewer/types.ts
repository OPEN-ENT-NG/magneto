type FileType =
  | "PDF"
  | "DOC"
  | "DOCX"
  | "ODT"
  | "RTF"
  | "WPD"
  | "XLSX"
  | "XLSM"
  | "XLT"
  | "XLTX"
  | "XLTM"
  | "ODS"
  | "CSV"
  | "TSV"
  | "TAB"
  | "TXT"
  | "MD"
  | "TEX";

export interface ExplorerFileViewerProps {
  file: string;
  type: FileType;
}
