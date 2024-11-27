import { FC } from "react";
import { CardContentFileProps } from "./types";
import { PDFUploadViewer } from "../PdfUploadViewer/PdfUploadViewer";
import CSVParser from "../csv-viewer/CSVViewer";
import FileInfos from "../file-infos/FileInfos";
import { useFileSize } from "~/hooks/useFileSize";
import { useBoard } from "~/providers/BoardProvider";
import { useFileExtensionDescription } from "~/hooks/useFileExtensionDescription";

export const CardContentFile: FC<CardContentFileProps> = ({ card }) => {
  const { documents, displayModals } = useBoard();
  const cardDocument = documents.find((doc) => doc._id === card.resourceId);
  const extensionText = useFileExtensionDescription(card.metadata.extension);
  const size = useFileSize(card.metadata.size);

  const isOfficePdf = () => {
    const ext = ["doc", "ppt", "odt"];
    return ext.includes(card.metadata.extension);
  };

  const isOfficeExcelOrCsv = () => {
    const ext = ["xls", "csv", "xlsx"];
    return ext.includes(card.metadata.extension);
  };

  return (
    <>
      <FileInfos
        fileName={card.metadata.filename}
        owner={cardDocument?.ownerName ?? ""}
        size={size.value + size.unit}
        fileType={extensionText}
        onDownload={() => console.log("Télécharger le fichier")}
        onEdit={() => console.log("Ouvrir dans Open Office")}
        onImport={() => console.log("Importer un nouveau fichier")}
        primaryBreakpoint={displayModals.CARD_PREVIEW ? "lg" : "lg35"}
        secondaryBreakpoint={displayModals.CARD_PREVIEW ? "xl" : "xl35"}
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
