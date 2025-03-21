import { FC } from "react";

import { filesize } from "filesize";

import { CardContentFileProps } from "./types";
import CSVParser from "../csv-viewer/CSVViewer";
import { FileInfos } from "../file-infos/FileInfos";
import { PDFUploadViewer } from "../PdfUploadViewer/PdfUploadViewer";
import { PreviewContentImage } from "../preview-content-image/PreviewContentImage";
import { RootsConst } from "~/core/constants/roots.const";
import { FILE_EXTENSION } from "~/core/enums/file-extension.enum";
import { ThemeBreakpoint } from "~/core/enums/theme-breakpoints.enum";
import { useFileExtensionDescription } from "~/hooks/useFileExtensionDescription";
import { useBoard } from "~/providers/BoardProvider";
import { useCanEditDocumentQuery } from "~/services/api/magnetoWorkspace.service";

export const CardContentFile: FC<CardContentFileProps> = ({ card }) => {
  const {
    documents,
    displayModals,
    hasEditRights,
    hasContribRights,
    hasManageRights,
    behaviours,
    isExternalView,
  } = useBoard();

  const cardDocument = documents.find((doc) => doc._id === card.resourceId);
  const extensionText = useFileExtensionDescription(card.metadata.extension);
  const { currentData: canEditDocument } = useCanEditDocumentQuery(
    card.resourceId,
  );
  const size = filesize(card.metadata.size);

  const isOfficePdf = () => {
    const ext = [
      FILE_EXTENSION.DOC,
      FILE_EXTENSION.DOCX,
      FILE_EXTENSION.PPT,
      FILE_EXTENSION.ODT,
      FILE_EXTENSION.PPTX,
      FILE_EXTENSION.ODP,
    ];
    return ext.includes(card.metadata.extension as FILE_EXTENSION);
  };

  const isOfficeExcelOrCsv = () => {
    const ext = [
      FILE_EXTENSION.CSV,
      FILE_EXTENSION.XLSX,
      FILE_EXTENSION.XLS,
      FILE_EXTENSION.ODS,
    ];
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
    window.open(
      `${isExternalView ? RootsConst.workspacePublic : RootsConst.workspace}${
        card.resourceId
      }`,
    );
  };

  const canDownload = card.locked ? hasManageRights() : hasContribRights();

  const edit = (): void => {
    behaviours?.applicationsBehaviours["lool"]?.openOnLool(cardDocument);
  };

  const canEdit = (): boolean => {
    if (
      behaviours?.applicationsBehaviours["lool"]?.provider === null ||
      cardDocument === undefined ||
      (card.locked ? !hasManageRights() : !hasEditRights())
    )
      return false;
    const ext: string[] = [
      FILE_EXTENSION.DOC,
      FILE_EXTENSION.DOCX,
      FILE_EXTENSION.PPT,
      FILE_EXTENSION.PPTX,
      FILE_EXTENSION.ODT,
      FILE_EXTENSION.XLS,
      FILE_EXTENSION.XLSX,
      FILE_EXTENSION.ODS,
      FILE_EXTENSION.ODP,
    ];
    const isoffice: boolean = ext.includes(card.metadata.extension);
    const canBeOpenOnLool: boolean =
      !behaviours?.applicationsBehaviours["lool"]?.failed &&
      behaviours?.applicationsBehaviours["lool"]?.canBeOpenOnLool(cardDocument);

    return !!canEditDocument && isoffice && canBeOpenOnLool;
  };

  return (
    <>
      <FileInfos
        fileName={card.metadata.filename}
        owner={cardDocument?.ownerName ?? ""}
        size={size}
        fileType={extensionText}
        canDownload={canDownload}
        onDownload={download}
        canEdit={canEdit()}
        onEdit={edit}
        secondaryBreakpoint={
          displayModals.CARD_PREVIEW
            ? ThemeBreakpoint.MDCOMMENT
            : ThemeBreakpoint.MD
        }
      />
      {card.metadata.extension === FILE_EXTENSION.PDF && (
        <PDFUploadViewer
          url={`${
            isExternalView ? RootsConst.workspacePublic : RootsConst.workspace
          }${card.resourceId}`}
        />
      )}
      {isImage() && (
        <PreviewContentImage
          ressourceUrl={
            isExternalView
              ? `${RootsConst.workspacePublic}${card.resourceId}`
              : card.resourceUrl
          }
        />
      )}
      {isOfficePdf() && (
        <PDFUploadViewer
          url={`${
            isExternalView ? RootsConst.workspacePublic : RootsConst.workspace
          }preview/${card.resourceId}`}
        />
      )}
      {isOfficeExcelOrCsv() && (
        <CSVParser
          resourceId={card.resourceId}
          isCSV={card.metadata.extension === FILE_EXTENSION.CSV}
        />
      )}
    </>
  );
};
