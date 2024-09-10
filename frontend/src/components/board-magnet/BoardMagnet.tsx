import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useBoard } from "~/providers/BoardProvider";
import { useUser } from "@edifice-ui/react";
import { FC } from "react";
import { BoardMagnetProps } from "./types";
import { MagnetContent } from "../magnet-content/MagnetContent";

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: ({ expand }) => !expand,
      style: {
        transform: "rotate(0deg)",
      },
    },
    {
      props: ({ expand }) => !!expand,
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
}));

export const BoardMagnet: FC<BoardMagnetProps> = ({ magnet }) => {
  const [expanded, setExpanded] = React.useState(false);

  const { board } = useBoard();

  const { user, avatar } = useUser();

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ width: 276, height: 300, flexWrap: "wrap" }}>
      <CardHeader
        avatar={<Avatar aria-label="recipe" src={avatar} />}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={user?.username}
        titleTypographyProps={{ textAlign: "center", fontSize: "14px" }}
        subheader="September 10, 2024"
        sx={{ paddingBottom: "0.1rem" }}
      />
      <CardContent
        sx={{
          height: "60%",
          paddingTop: 0,
          paddingBottom: "0.5rem",
        }}
      >
        <Typography
          sx={{ fontSize: "16px", fontWeight: "bold", paddingBottom: "1.5rem" }}
        >
          {magnet.title}
        </Typography>
        <MagnetContent magnet={magnet} />
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
