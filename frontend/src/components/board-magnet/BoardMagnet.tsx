import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useBoard } from "~/providers/BoardProvider";
import { useUser } from "@edifice-ui/react";
import { FC } from "react";
import { BoardMagnetProps } from "./types";
import { MagnetContent } from "../magnet-content/MagnetContent";
import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";
import Icon from "@mdi/react";
import {
  mdiFileMultiple,
  mdiFormatSize,
  mdiImage,
  mdiLink,
  mdiMusicNote,
  mdiPlayCircle,
} from "@mdi/js";

const handleCardSize = (zoomLevel: number) => {
  let cardSize = { width: "269px", height: "264px", margin: "15px" };

  switch (
    zoomLevel //will be replaced by card size later --> card margins etc
  ) {
    case 0:
      cardSize = { width: "132px", height: "127px", margin: "2px" };
      break;
    case 1:
      cardSize = { width: "183px", height: "180px", margin: "5px" };
      break;
    case 2:
      cardSize = { width: "228px", height: "223px", margin: "10px" };
      break;
    case 3:
      cardSize = { width: "269px", height: "264px", margin: "15px" };
      break;
    case 4:
      cardSize = { width: "330px", height: "310px", margin: "5px" };
      break;
    case 5:
      cardSize = { width: "371px", height: "350px", margin: "15px" };
      break;
  }
  return cardSize;
};

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ zoomLevel }) => ({
  display: "flex",
  position: "relative",
  flexDirection: "column",
  boxSizing: "border-box",
  width: handleCardSize(zoomLevel).width,
  height: handleCardSize(zoomLevel).height,
  margin: handleCardSize(zoomLevel).margin,
}));

const StyledCardHeader = styled(CardHeader, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ zoomLevel }) => ({
  padding: "0.5rem",
  paddingBottom: "0.1rem",
  "& .MuiCardHeader-content": {
    overflow: "hidden",
    flex: "1 1 auto",
    ...(zoomLevel > 1 && {
      textAlign: "center",
    }),
  },
  "& .MuiCardHeader-title": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "1.4rem",
  },
  "& .MuiCardHeader-subheader": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "1.4rem",
  },
  "& .MuiCardHeader-avatar": {
    marginRight: "0.8rem",
    marginLeft: 0,
    marginTop: "-0.5rem",
  },
  "& .MuiCardHeader-action": {
    marginLeft: 0,
    marginRight: "-0.4rem",
    marginTop: 0,
    pt: 0,
    pb: 0,
  },
}));

const StyledIconButton = styled(IconButton)({
  padding: 0,
  width: "3rem",
  height: "3rem",
  "& .MuiSvgIcon-root": {
    fontSize: "2.4rem",
  },
});

export const BoardMagnet: FC<BoardMagnetProps> = ({ magnet }) => {
  const { zoomLevel } = useBoard();
  const { user, avatar } = useUser();

  const bottomDisplay = () => {
    //TODO : TypographyStyled avec les props d'angular
    switch (magnet.resourceType) {
      case RESOURCE_TYPE.VIDEO:
        return (
          <>
            <Icon path={mdiPlayCircle} size={1} />
            Vidéo
          </>
        );
      case RESOURCE_TYPE.LINK:
        return (
          <>
            <Icon path={mdiLink} size={1} />
            Lien
          </>
        );

      case RESOURCE_TYPE.TEXT:
        return (
          <>
            <Icon path={mdiFormatSize} size={1} />
            Texte
          </>
        );
      case RESOURCE_TYPE.IMAGE:
        return (
          <>
            <Icon path={mdiImage} size={1} />
            Image
          </>
        );
      case RESOURCE_TYPE.AUDIO:
        return (
          <>
            <Icon path={mdiMusicNote} size={1} />
            Audio
          </>
        );
      case RESOURCE_TYPE.FILE:
        return (
          <>
            <Icon path={mdiFileMultiple} size={1} />
            Fichier
          </>
        );
    }
  };

  return (
    <StyledCard zoomLevel={zoomLevel}>
      <StyledCardHeader
        zoomLevel={zoomLevel}
        avatar={
          <Avatar
            aria-label="recipe"
            sx={{ width: "3rem", height: "3rem", padding: 0 }}
            src={avatar}
          />
        }
        action={
          <StyledIconButton aria-label="settings">
            <MoreVertIcon />
          </StyledIconButton>
        }
        title={user?.username}
        subheader="September 10, 2024"
      />
      <CardContent
        sx={{
          flex: 1,
          overflow: "hidden",
          paddingLeft: "0.6rem",
          pr: "0.6rem",
          paddingTop: 0,
          paddingBottom: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.6rem",
            fontWeight: "bold",
            marginBottom: "0.5rem",
            lineHeight: "1.8rem",
            overflowWrap: "break-word",
            ...(zoomLevel < 2 && {
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: zoomLevel === 0 ? "3" : "4",
              WebkitBoxOrient: "vertical",
            }),
            ...(zoomLevel >= 2 && {
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }),
          }}
        >
          {magnet.title}
        </Typography>
        {zoomLevel > 1 && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <MagnetContent magnet={magnet} />
          </div>
        )}
      </CardContent>
      <CardActions
        disableSpacing
        sx={{
          justifyContent: "space-between",
          pl: "0,4rem",
          pr: "0.4rem",
          pb: 0,
          pt: 0,
          alignItems: "center",
        }}
      >
        {bottomDisplay()}
        <IconButton aria-label="add to favorites" size="small">
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </StyledCard>
  );
};
