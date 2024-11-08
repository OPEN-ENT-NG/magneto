import { FC, useState, DragEvent, useRef } from "react";

import { useWorkspaceFile } from "@edifice-ui/react";
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
import { FILE_VALIDATION_CONFIG } from "~/core/constants/fileValidation.config.const";
import { useBoard } from "~/providers/BoardProvider";

export const FileDropZone: FC = () => {
  const [isExplorerDragging, setIsExplorerDragging] = useState<boolean>(false);
  const dragCounter = useRef(0);
  const { create } = useWorkspaceFile();
  const {
    board: { title },
  } = useBoard();
  const { t } = useTranslation("magneto");

  const validateFile = (dataTransfer: DataTransfer | null): boolean => {
    if (!dataTransfer?.types) return false;
    const isFile =
      dataTransfer.types.includes("Files") &&
      !dataTransfer.types.includes("application/x-moz-file");
    if (!isFile) return false;
    if (dataTransfer.files.length !== 1) {
      console.log(dataTransfer.files.length);
      console.warn("Only one file can be dropped at a time");
      return false;
    }
    const file = dataTransfer.files[0];

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    console.log(fileExtension);

    const hasValidExtension = fileExtension
      ? FILE_VALIDATION_CONFIG.allowedExtensions.includes(fileExtension)
      : false;
    const hasValidSize = file.size <= FILE_VALIDATION_CONFIG.maxSizeInBytes;
    if (!hasValidExtension) {
      console.warn(
        `Invalid file extension. Allowed extensions: ${FILE_VALIDATION_CONFIG.allowedExtensions.join(
          ", ",
        )}`,
      );
    }
    if (!hasValidSize) {
      console.warn(
        `File too large. Maximum size: ${
          FILE_VALIDATION_CONFIG.maxSizeInBytes / 1024 / 1024
        }MB`,
      );
    }

    return hasValidExtension && hasValidSize;
  };

  const handleDragEnter = (event: DragEvent): void => {
    event.preventDefault();
    dragCounter.current++;
    setIsExplorerDragging(true);
  };

  const handleDragLeave = (event: DragEvent): void => {
    event.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsExplorerDragging(false);
    }
  };

  const handleDrop = async (event: DragEvent): Promise<void> => {
    event.preventDefault();
    dragCounter.current = 0;

    if (!validateFile(event.dataTransfer)) {
      return setIsExplorerDragging(false);
    }

    setIsExplorerDragging(false);

    const file = event.dataTransfer.files[0];
    try {
      const createResponse = await create(file, {
        visibility: "protected",
        application: "magneto",
      });






















      

      const url = `/workspace/${
        createResponse?.public ? "pub/" : ""
      }document/${createResponse?._id}`;

      console.log({ createResponse, url });
    } catch (error) {
      console.error(
        "Erreur lors de la création ou récupération du fichier:",
        error,
      );
    }
  };

  return (
    <DragBox isDragging={isExplorerDragging}>
      <InnerBox
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
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
