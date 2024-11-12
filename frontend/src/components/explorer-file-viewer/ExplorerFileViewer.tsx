import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import * as XLSX from "xlsx";
import * as mammoth from "mammoth";
import { ExplorerFileViewerProps } from "./types";

export const ExplorerFileViewer = ({ file, type }: ExplorerFileViewerProps) => {
  const [fileContent, setFileContent] = useState<Buffer | null>(null);
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchFileContent = async () => {
      try {
        const response = await fetch(file);
        console.log(response);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        setFileContent(buffer);

        if (
          type === "DOC" ||
          type === "DOCX" ||
          type === "ODT" ||
          type === "RTF" ||
          type === "WPD"
        ) {
          const result = await mammoth.convertToHtml({ buffer });
          setHtmlContent(result.value);
        }
      } catch (error) {
        console.error("Error fetching or converting file:", error);
        setHtmlContent(
          "Une erreur est survenue lors de la récupération ou la conversion du fichier.",
        );
      }
    };
    fetchFileContent();
  }, [file, type]);

  switch (type) {
    case "PDF":
      return (
        <Document file={fileContent}>
          <Page />
        </Document>
      );
    case "DOC":
    case "DOCX":
    case "ODT":
    case "RTF":
    case "WPD":
      return (
        <div>
          {htmlContent && (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          )}
        </div>
      );
    case "XLSX":
    case "XLSM":
    case "XLT":
    case "XLTX":
    case "XLTM":
    case "ODS":
    case "CSV":
    case "TSV":
    case "TAB":
      return (
        <div>
          {/* Afficher le contenu du fichier Excel */}
          {/* Nécessite l'installation du package 'xlsx' */}
          {/* Le package 'xlsx' prend en charge tous les formats Excel mentionnés */}
        </div>
      );
    case "TXT":
    case "MD":
    case "TEX":
      return (
        <div>
          {/* Afficher le contenu du fichier texte brut */}
          {/* Peut être fait simplement en lisant le contenu du fichier */}
        </div>
      );
    default:
      return <div>Fichier non pris en charge</div>;
  }
};
