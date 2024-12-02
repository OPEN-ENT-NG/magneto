import { FC, useEffect } from "react";

import { filesize } from "filesize";

import { CardContentFileProps } from "./types";
import CSVParser from "../csv-viewer/CSVViewer";
import { FileInfos } from "../file-infos/FileInfos";
import { PDFUploadViewer } from "../PdfUploadViewer/PdfUploadViewer";
import { PreviewContentImage } from "../preview-content-image/PreviewContentImage";
import { FILE_EXTENSION } from "~/core/enums/file-extension.enum";
import { ThemeBreakpoint } from "~/core/enums/theme-breakpoints.enum";
import { useEntcoreBehaviours } from "~/hooks/useEntcoreBehaviours";
import { useFileExtensionDescription } from "~/hooks/useFileExtensionDescription";
import { useBoard } from "~/providers/BoardProvider";
import { useCanEditDocumentQuery } from "~/services/api/magnetoWorkspace.service";

export const CardContentFile: FC<CardContentFileProps> = ({ card }) => {
  const { documents, displayModals, hasEditRights } = useBoard();
  const { behaviours, isLoading } = useEntcoreBehaviours();

  const initLool = async () => {
    await behaviours.applicationsBehaviours["lool"].init();
  };

  const cardDocument = documents.find((doc) => doc._id === card.resourceId);
  const extensionText = useFileExtensionDescription(card.metadata.extension);
  const { currentData: canEditDocument } = useCanEditDocumentQuery(
    card.resourceId,
  );
  const size = filesize(card.metadata.size);

  useEffect(() => {
    initLool();
  }, [isLoading]);

  const isOfficePdf = () => {
    const ext = [
      FILE_EXTENSION.DOC,
      FILE_EXTENSION.DOCX,
      FILE_EXTENSION.PPT,
      FILE_EXTENSION.ODT,
    ];
    return ext.includes(card.metadata.extension as FILE_EXTENSION);
  };

  const isOfficeExcelOrCsv = () => {
    const ext = [FILE_EXTENSION.CSV];
    return ext.includes(card.metadata.extension as FILE_EXTENSION);
  };

  const isImage = () => {
    const imageExtensions = [
      FILE_EXTENSION.JPG,
      FILE_EXTENSION.JPEG,
      FILE_EXTENSION.PNG,
      FILE_EXTENSION.GIF,
      FILE_EXTENSION.BMP,
      FILE_EXTENSION.TIFF,
      FILE_EXTENSION.TIF,
      FILE_EXTENSION.EPS,
      FILE_EXTENSION.RAW,
    ];
    return imageExtensions.includes(card.metadata.extension as FILE_EXTENSION);
  };

  const download = () => {
    window.open(`/workspace/document/${card.resourceId}`);
  };

  const edit = (): void => {
    behaviours?.applicationsBehaviours["lool"]?.openOnLool(cardDocument);
  };

  const canEdit = (): boolean => {
    if (
      behaviours?.applicationsBehaviours["lool"]?.provider === null ||
      cardDocument === undefined
    )
      return false;
    const ext: string[] = [
      FILE_EXTENSION.DOC,
      FILE_EXTENSION.DOCX,
      FILE_EXTENSION.PPT,
      FILE_EXTENSION.ODT,
      FILE_EXTENSION.XLS,
    ];
    const isoffice: boolean = ext.includes(card.metadata.extension);
    const canBeOpenOnLool: boolean =
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
      {card.metadata.extension === FILE_EXTENSION.PDF && (
        <PDFUploadViewer url={`/workspace/document/${card.resourceId}`} />
      )}
      {isImage() && <PreviewContentImage ressourceUrl={card.resourceUrl} />}
      {isOfficePdf() && (
        <PDFUploadViewer
          url={`/workspace/document/preview/${card.resourceId}`}
        />
      )}
      {isOfficeExcelOrCsv() && <CSVParser ressourceId={card.resourceId} />}
    </>
  );
};
