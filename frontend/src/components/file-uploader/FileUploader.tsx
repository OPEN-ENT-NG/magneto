import { FC, useState, DragEvent } from "react";

import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  cloudIconStyle,
  DragBox,
  ellipsisBoxStyle,
  flyingBox,
  InnerBox,
  textStyle,
  whiteBoxStyle,
} from "./style";
import { FileDropZoneProps } from "./types";
import { useBoard } from "~/providers/BoardProvider";

export const FileDropZone: FC<FileDropZoneProps> = ({ onFilesDrop }) => {
  const [isExplorerDragging, setIsExplorerDragging] = useState<boolean>(false);
  const {
    board: { title },
  } = useBoard();
  const { t } = useTranslation("magneto");
  const isFromExplorer = (dataTransfer: DataTransfer | null): boolean => {
    if (!dataTransfer?.types) return false;
    return (
      dataTransfer.types.includes("Files") &&
      !dataTransfer.types.includes("application/x-moz-file")
    );
  };

  const handleDragOver = (event: DragEvent): void => {
    event.stopPropagation();
    if (!isFromExplorer(event.dataTransfer)) return;
    event.preventDefault();
    setIsExplorerDragging(true);
  };

  const handleDragLeave = (event: DragEvent): void => {
    event.stopPropagation();
    if (!isFromExplorer(event.dataTransfer)) return;
    setIsExplorerDragging(false);
  };

  const handleDrop = (event: DragEvent): void => {
    event.stopPropagation();
    event.preventDefault();

    if (!isFromExplorer(event.dataTransfer)) return;

    setIsExplorerDragging(false);

    const files = Array.from(event.dataTransfer.files);
    console.log("Dropped files:", files);
    onFilesDrop?.(files);
  };

  return (
    <DragBox isDragging={isExplorerDragging}>
      <InnerBox
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isExplorerDragging={isExplorerDragging}
      >
        {isExplorerDragging && (
          <Box sx={flyingBox}>
            <Typography sx={textStyle}>
              <Box sx={ellipsisBoxStyle}>
                {t("magneto.dropzone.overlay.label", { board: title })}
              </Box>
              <Box sx={whiteBoxStyle}></Box>
              <CloudDownloadIcon sx={cloudIconStyle} />
            </Typography>
          </Box>
        )}
      </InnerBox>
    </DragBox>
  );
};
