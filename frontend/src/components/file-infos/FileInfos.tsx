import React from "react";
import { styled } from "@mui/material/styles";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  ButtonGroup,
  Button,
} from "@mui/material";

const FileInfosStyled = styled(Card)(({ theme }) => ({
  "& .MuiCardHeader-root": {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2, 4),
  },
  "& .MuiCardContent-root": {
    padding: theme.spacing(3, 4),
    display: "flex",
    flexDirection: "column",
    "& .MuiTypography-root": {
      fontSize: "2rem",
      marginBottom: theme.spacing(1),
      "& span": {
        fontWeight: "bold",
      },
    },
    "& .MuiButtonGroup-root": {
      marginTop: theme.spacing(2),
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
    },
  },
}));

interface FileInfoCardProps {
  fileName: string;
  owner: string;
  size: string;
  fileType: string;
  createdAt: string;
  modifiedAt: string;
  onDownload: () => void;
  onEdit: () => void;
  onImport: () => void;
}

export const FileInfos: React.FC<FileInfoCardProps> = ({
  fileName,
  owner,
  size,
  fileType,
  createdAt,
  modifiedAt,
  onDownload,
  onEdit,
  onImport,
}) => {
  return (
    <FileInfosStyled variant="outlined">
      <CardHeader
        title={fileName}
        subheader={`Créé par ${owner}, modifié le ${modifiedAt}`}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Propriétaire : <span>{owner}</span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Taille : <span>{size}</span>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Type : <span>{fileType}</span>
        </Typography>
        <ButtonGroup
          variant="text"
          color="primary"
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            "& .MuiButton-root": {
              height: "100%", // Assure une hauteur uniforme
              display: "flex",
              alignItems: "center",
            },
          }}
        >
          <Button onClick={onDownload}>Télécharger</Button>
          <Button onClick={onEdit}>Editer dans Open Office</Button>
          <Button onClick={onImport}>Importer un nouveau fichier</Button>
        </ButtonGroup>
      </CardContent>
    </FileInfosStyled>
  );
};

export default FileInfos;
