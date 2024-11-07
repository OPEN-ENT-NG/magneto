import React from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  useMediaQuery,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTranslation } from "react-i18next";
import { useBoard } from "~/providers/BoardProvider";
import ScriptLoader from "../script-loader/ScriptLoader";
import { useEntcoreBehaviours } from "~/hooks/useEntcoreBehaviours";

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
}

export const FileInfos: React.FC<FileInfoCardProps> = ({
  fileName,
  owner,
  size,
  fileType,
  onDownload,
  onEdit,
  onImport,
}) => {
  const { t } = useTranslation("magneto");
  const { displayModals } = useBoard();
  const { behaviours, isLoading } = useEntcoreBehaviours();

  // Utiliser le contexte MUI pour les points de rupture
  const isCommentPanelOpen = displayModals.COMMENT_PANEL;
  const isMediumOrLessScreen = useMediaQuery(
    (theme: any) => theme.breakpoints.down("lg"), // correspond à la largeur sous 1280px
  );
  const isLessThanXL = useMediaQuery((theme: any) =>
    theme.breakpoints.down("xl"),
  );

  const isHorizontal =
    isMediumOrLessScreen || (isCommentPanelOpen && isLessThanXL);

  return (
    <>
      {behaviours && !isLoading && (
        <div>
          <h2>Behaviours chargés</h2>
          {/* Utilisez behaviours ici */}
          <pre>{JSON.stringify(behaviours, null, 2)}</pre>
        </div>
      )}
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
              Propriétaire : <span>{owner}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taille : <span>{size}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Type : <span>{fileType}</span>
            </Typography>
          </Box>
          <Box className={`button-group`}>
            <Button
              className="download-btn"
              variant="outlined"
              onClick={onDownload}
            >
              <DownloadIcon sx={{ fontSize: 27 }} />
              Télécharger
            </Button>
            <Button
              className="download-btn"
              variant="outlined"
              onClick={onEdit}
            >
              <EditIcon />
              Editer dans Open Office
            </Button>
            <Button
              className="download-btn"
              variant="outlined"
              onClick={onImport}
            >
              <CloudUploadIcon />
              Importer un nouveau fichier
            </Button>
          </Box>
        </CardContent>
      </FileInfosStyled>
    </>
  );
};

export default FileInfos;
