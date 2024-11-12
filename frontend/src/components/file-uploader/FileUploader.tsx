import { FC, useState, DragEvent, useRef } from "react";

import { useToast, useWorkspaceFile } from "@edifice-ui/react";
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
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const FileDropZone: FC = () => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const { setWorkspaceElement } = useMediaLibrary();
  const toast = useToast();
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
      toast.error(t("magneto.dropzone.create.error"));
      return false;
    }
    const file = dataTransfer.files[0];

    if (file.type === "" && file.size === 0) {
      toast.warning(t("magneto.dropzone.overlay.warning"));
      return false;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();

    const hasValidExtension = fileExtension
      ? FILE_VALIDATION_CONFIG.allowedExtensions.includes(fileExtension)
      : false;
    const hasValidSize = file.size <= FILE_VALIDATION_CONFIG.maxSizeInBytes;
    if (!hasValidExtension) {
      toast.error(t("magneto.dropzone.create.error"));
    }
    if (!hasValidSize) {
      toast.error(t("magneto.dropzone.create.error"));
    }

    return hasValidExtension && hasValidSize;
  };

  const handleDragEnter = (event: DragEvent): void => {
    event.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent): void => {
    event.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (event: DragEvent): Promise<void> => {
    event.preventDefault();
    dragCounter.current = 0;

    if (!validateFile(event.dataTransfer)) {
      return setIsDragging(false);
    }

    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    try {
      const newWorkspaceElement = await create(file, {
        visibility: "protected",
        application: "magneto",
      });
      setWorkspaceElement(newWorkspaceElement);
    } catch (error) {
      toast.error(t("magneto.dropzone.create.error"));
    }
  };

  return (
    <DragBox isDragging={isDragging} data-dragging={isDragging}>
      <InnerBox
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        isDragging={isDragging}
      >
        {isDragging && (
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
