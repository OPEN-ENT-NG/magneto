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

const StyledCardHeader = styled(CardHeader, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ theme, zoomLevel }) => ({
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

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
        sx={{ justifyContent: "flex-end", padding: 0 }}
      >
        <IconButton aria-label="add to favorites" size="small">
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
