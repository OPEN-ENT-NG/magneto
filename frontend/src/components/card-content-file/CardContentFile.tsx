import { FC } from "react";

import { filesize } from "filesize";

import { CardContentFileProps } from "./types";
import CSVParser from "../csv-viewer/CSVViewer";
import { FileInfos } from "../file-infos/FileInfos";
import { PDFUploadViewer } from "../PdfUploadViewer/PdfUploadViewer";
import { FILE_EXTENSION } from "~/core/enums/file-extension.enum";
import { ThemeBreakpoint } from "~/core/enums/theme-breakpoints.enum";
import { useEntcoreBehaviours } from "~/hooks/useEntcoreBehaviours";
import { useFileExtensionDescription } from "~/hooks/useFileExtensionDescription";
import { useBoard } from "~/providers/BoardProvider";
import { useCanEditDocumentQuery } from "~/services/api/magnetoWorkspace.service";

export const CardContentFile: FC<CardContentFileProps> = ({ card }) => {
  const { documents, displayModals, hasEditRights } = useBoard();
  const { behaviours, isInitialized } = useEntcoreBehaviours();

  const cardDocument = documents.find((doc) => doc._id === card.resourceId);
  const extensionText = useFileExtensionDescription(card.metadata.extension);
  const { currentData: canEditDocument } = useCanEditDocumentQuery(
    card.resourceId,
  );
  const size = filesize(card.metadata.size);

  const isOfficePdf = () => {
    const ext = [FILE_EXTENSION.DOC, FILE_EXTENSION.PPT, FILE_EXTENSION.ODT];
    return ext.includes(card.metadata.extension as FILE_EXTENSION);
  };

  const isOfficeExcelOrCsv = () => {
    const ext = [FILE_EXTENSION.XLS, FILE_EXTENSION.CSV, FILE_EXTENSION.XLSX];
    return ext.includes(card.metadata.extension as FILE_EXTENSION);
  };

  const download = () => {
    window.open(`/workspace/document/${card.resourceId}`);
  };

  const edit = (): void => {
    behaviours?.applicationsBehaviours["lool"]?.openOnLool(cardDocument);
  };

  const canEdit = (): boolean => {
    const ext: string[] = ["doc", "ppt", "xls"];
    const isoffice: boolean = ext.includes(card.metadata.extension);
    const canBeOpenOnLool: boolean =
      isInitialized &&
      !behaviours?.applicationsBehaviours["lool"]?.failed &&
      behaviours?.applicationsBehaviours["lool"]?.canBeOpenOnLool(cardDocument);

    return !!canEditDocument && hasEditRights() && isoffice && canBeOpenOnLool;
  };

  return (
    <>
      <FileInfos
        fileName={card.metadata.filename}
        owner={cardDocument?.ownerName ?? ""}
        size={size}
        fileType={extensionText}
        canDownload={hasEditRights()}
        onDownload={download}
        canEdit={canEdit()}
        onEdit={edit}
        onImport={() => {}}
        primaryBreakpoint={
          displayModals.CARD_PREVIEW ? ThemeBreakpoint.LG : ThemeBreakpoint.LG35
        }
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
