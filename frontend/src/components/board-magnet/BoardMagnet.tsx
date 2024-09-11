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
  padding: "5px",
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
    fontSize: "14px",
  },
  "& .MuiCardHeader-subheader": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "14px",
  },
  "& .MuiCardHeader-avatar": {
    marginRight: 8,
    marginLeft: 0,
    marginTop: -5,
  },
  "& .MuiCardHeader-action": {
    marginLeft: 8,
    marginRight: -4,
    marginTop: 0,
  },
}));

const StyledIconButton = styled(IconButton)({
  padding: 0,
  width: "30px",
  height: "30px",
  "& .MuiSvgIcon-root": {
    fontSize: "24px",
  },
});

export const BoardMagnet: FC<BoardMagnetProps> = ({ magnet }) => {
  const { board, zoomLevel } = useBoard();
  const { user, avatar } = useUser();

  return (
    <Card sx={{ width: "100%", height: "100%" }}>
      <StyledCardHeader
        zoomLevel={zoomLevel}
        avatar={
          <Avatar
            aria-label="recipe"
            sx={{ width: "30px", height: "30px", padding: 0 }}
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
          height: "60%",
          paddingTop: 0,
          paddingBottom: "1.5rem",
          paddingLeft: "6px",
          paddingRight: "6px",
        }}
      >
        {zoomLevel < 2 ? (
          <Typography
            sx={{
              fontSize: "16px",
              fontWeight: "bold",
              display: "-webkit-box",
              overflow: "hidden",
              textOverflow: "ellipsis",
              WebkitLineClamp: zoomLevel === 0 ? "3" : "4",
              WebkitBoxOrient: "vertical",
              width: "100%",
              lineHeight: "18px",
              height: "auto",
            }}
          >
            {magnet.title}
          </Typography>
        ) : (
          <Typography
            noWrap
            sx={{
              fontSize: "16px",
              fontWeight: "bold",
              paddingBottom: "1.5rem",
            }}
          >
            {magnet.title}
          </Typography>
        )}
        {zoomLevel > 1 && <MagnetContent magnet={magnet} />}
      </CardContent>
      <CardActions disableSpacing sx={{ display: "flex" }}>
        <IconButton
          aria-label="add to favorites"
          sx={{ flexGrow: 1, justifyContent: "flex-end" }}
        >
          <FavoriteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};
