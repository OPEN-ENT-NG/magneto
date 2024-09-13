import { FC } from "react";

import { useUser } from "@edifice-ui/react";
import Icon from "@mdi/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Tooltip } from "@mui/material";
import IconButton from "@mui/material/IconButton";

import {
  StyledTypography,
  StyledCard,
  StyledCardHeader,
  StyledIconButton,
  StyledTypographySubheader,
  StyledAvatar,
  StyledCardContent,
  StyledContentTitleTypography,
  StyledCardActions,
} from "./style";
import { BoardCardProps } from "./types";
import { useResourceTypeDisplay } from "./useResourceTypeDisplay";
import { CardContent } from "../card-content/CardContent";
import { useElapsedTime } from "~/hooks/useElapsedTime";

export const BoardCard: FC<BoardCardProps> = ({ card, zoomLevel }) => {
  const { user, avatar } = useUser();
  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const time = useElapsedTime(card.modificationDate);

  return (
    <StyledCard zoomLevel={zoomLevel}>
      <StyledCardHeader
        zoomLevel={zoomLevel}
        avatar={<StyledAvatar aria-label="recipe" src={avatar} />}
        action={
          <StyledIconButton aria-label="settings">
            <MoreVertIcon />
          </StyledIconButton>
        }
        title={user?.username}
        subheader={
          <Tooltip
            title={time.tooltip}
            placement="bottom"
            TransitionProps={{
              style: { marginTop: "-0.5rem" },
            }}
            componentsProps={{
              tooltip: {
                sx: {
                  fontSize: "1.4rem",
                },
              },
            }}
          >
            <StyledTypographySubheader>{time.label}</StyledTypographySubheader>
          </Tooltip>
        }
      />
      <StyledCardContent>
        <StyledContentTitleTypography zoomLevel={zoomLevel}>
          {card.title}
        </StyledContentTitleTypography>
        {zoomLevel > 1 && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <CardContent card={card} />
          </div>
        )}
      </StyledCardContent>
      <StyledCardActions zoomLevel={zoomLevel} disableSpacing>
        <StyledTypography>
          <Icon path={icon} size={1} />
          {type}
        </StyledTypography>
        <IconButton aria-label="add to favorites" size="small">
          <StarBorderIcon />
        </IconButton>
      </StyledCardActions>
    </StyledCard>
  );
};
