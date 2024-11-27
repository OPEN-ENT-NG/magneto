import React, { useEffect } from "react";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

import { useEntcoreBehaviours } from "~/hooks/useEntcoreBehaviours";
import { useBoard } from "~/providers/BoardProvider";

const FileInfosStyled = styled(Card, {
  shouldForwardProp: (prop) => prop !== "isHorizontal",
})<{ isHorizontal: boolean }>(({ theme, isHorizontal }) => ({
  width: "100%",
  "& .MuiCardContent-root": {
    padding: theme.spacing(3, 4),
    display: "flex",
    flexDirection: isHorizontal ? "column" : "row",
    justifyContent: isHorizontal ? "initial" : "space-between",
    alignItems: isHorizontal ? "initial" : "center",

    "& .text-content": {
      display: "flex",
      flexDirection: "column",
      marginBottom: isHorizontal ? theme.spacing(2) : 0,
      marginRight: isHorizontal ? 0 : theme.spacing(2),
      "& .MuiTypography-root": {
        fontSize: "1.5rem",
        marginBottom: theme.spacing(1),
        wordBreak: "break-word",
        "& span": {
          fontWeight: "bold",
        },
      },
    },
    "& .button-group": {
      display: "flex",
      flexDirection: isHorizontal ? "column" : "row",
      gap: theme.spacing(2),
      alignItems: isHorizontal ? "initial" : "center",
      "& .download-btn": {
        color: "#FF6600",
        border: "1px solid #FF6600",
        backgroundColor: "white",
        textTransform: "none",
        fontSize: "1.5rem",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        flexShrink: isHorizontal ? 0 : 1,
      },
    },
  },
}));

interface FileInfoCardProps {
  fileName: string;
  owner: string;
  size: string;
  fileType: string;
  onDownload: () => void;
  onEdit: () => void;
  onImport: () => void;
  primaryBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | "lg35" | "xl35";
  secondaryBreakpoint?: "xs" | "sm" | "md" | "lg" | "xl" | "lg35" | "xl35";
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
