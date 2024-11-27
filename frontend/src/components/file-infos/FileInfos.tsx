import React, { useEffect } from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import {
  CardContent,
  Typography,
  Box,
  Button,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { FileInfosStyled } from "./style";
import { useEntcoreBehaviours } from "~/hooks/useEntcoreBehaviours";
import { useBoard } from "~/providers/BoardProvider";

interface FileInfoCardProps {
  fileName: string;
  owner: string;
  size: string;
  fileType: string;
  onDownload: () => void;
  onEdit: () => void;
  onImport: () => void;
  primaryBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | "lg35";
  secondaryBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | "lg35";
}

export const FileInfos: React.FC<FileInfoCardProps> = ({
  fileName,
  owner,
  size,
  fileType,
  onDownload,
  onEdit,
  onImport,
  primaryBreakpoint = "lg",
  secondaryBreakpoint = "xl",
}) => {
  const { t } = useTranslation("magneto");
  const { displayModals } = useBoard();
  const { behaviours } = useEntcoreBehaviours();

  useEffect(() => {
    console.log(behaviours);
  }, [behaviours]);

  // Utiliser le contexte MUI pour les points de rupture
  const isCommentPanelOpen = displayModals.COMMENT_PANEL;

  const isPrimaryBreakpoint = useMediaQuery((theme: any) =>
    theme.breakpoints.down(primaryBreakpoint),
  );

  const isSecondaryBreakpoint = useMediaQuery((theme: any) =>
    theme.breakpoints.down(secondaryBreakpoint),
  );

  const isHorizontal =
    isPrimaryBreakpoint || (isCommentPanelOpen && isSecondaryBreakpoint);

  return (
    <>
      <h1
        style={{
          paddingTop: "2rem",
          paddingBottom: "1rem",
          color: "#2A9AC7",
          wordBreak: "break-word",
        }}
      >
        {fileName}
      </h1>
      <FileInfosStyled variant="outlined" isHorizontal={isHorizontal}>
        <CardContent>
          <Box className={`text-content`}>
            <Typography variant="body2" color="text.secondary">
              {t("magneto.board.owner")} : <span>{owner}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("magneto.board.size")} : <span>{size}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("magneto.board.type")} : <span>{fileType}</span>
            </Typography>
          </Box>
          <Box className={`button-group`}>
            <Button
              className="download-btn"
              variant="outlined"
              onClick={onDownload}
            >
              <DownloadIcon sx={{ fontSize: 27 }} />
              {t("magneto.board.download")}
            </Button>
            <Button
              className="download-btn"
              variant="outlined"
              onClick={onEdit}
            >
              <EditIcon />
              {t("magneto.board.edit.open.office")}
            </Button>
            <Button
              className="download-btn"
              variant="outlined"
              onClick={onImport}
            >
              <CloudUploadIcon />
              {t("magneto.board.import.file")}
            </Button>
          </Box>
        </CardContent>
      </FileInfosStyled>
    </>
  );
};

export default FileInfos;
