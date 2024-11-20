import { FC } from "react";
import { CardContentFileProps } from "./types";
import { PDFUploadViewer } from "../PdfUploadViewer/PdfUploadViewer";
import CSVParser from "../csv-viewer/CSVViewer";
import FileInfos from "../file-infos/FileInfos";

export const CardContentFile: FC<CardContentFileProps> = ({ card }) => {
  const isOfficePdf = () => {
    const ext = ["doc", "ppt", "odt"];
    return ext.includes(card.metadata.extension);
  };

  const isOfficeExcelOrCsv = () => {
    const ext = ["xls", "csv"];
    return ext.includes(card.metadata.extension);
  };

  return (
    <>
      <FileInfos
        fileName="Nom_fichier.pptx"
        owner="Nom Prénom"
        size="39 Ko"
        fileType="Présentation Microsoft PowerPoint (.pptx)"
        createdAt="15/03/24"
        modifiedAt="15/03/24"
        onDownload={() => console.log("Télécharger le fichier")}
        onEdit={() => console.log("Ouvrir dans Open Office")}
        onImport={() => console.log("Importer un nouveau fichier")}
      />
      {card.metadata.extension === "pdf" && (
        <PDFUploadViewer url={`/workspace/document/${card.resourceId}`} />
      )}
      {isOfficePdf() && (
        <PDFUploadViewer
          url={`/workspace/document/preview/${card.resourceId}`}
        />
      )}
      {isOfficeExcelOrCsv() && <CSVParser ressourceId={card.resourceId} />}
    </>
  );
};
