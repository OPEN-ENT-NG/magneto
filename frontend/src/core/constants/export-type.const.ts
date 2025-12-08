import { ExportType } from "../enums/export-type.enum";

export interface ExportResponse {
  data: Blob;
  headers: Record<string, string>;
}

export const EXPORT_ENDPOINT_MAP: Record<ExportType, string> = {
  [ExportType.PPTX]: "slide",
  [ExportType.PDF]: "pdf",
  [ExportType.PNG]: "png",
  [ExportType.CSV]: "csv",
};

export const EXPORT_FILE_EXTENSION: Record<ExportType, string> = {
  [ExportType.PPTX]: "zip",
  [ExportType.PDF]: "pdf",
  [ExportType.PNG]: "zip",
  [ExportType.CSV]: "csv",
};

export const EXPORT_MIME_TYPE: Record<ExportType, string> = {
  [ExportType.PPTX]: "application/zip",
  [ExportType.PDF]: "application/pdf",
  [ExportType.PNG]: "application/zip",
  [ExportType.CSV]: "text/csv",
};
