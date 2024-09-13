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
import { BoardMagnetProps } from "./types";
import { useResourceTypeDisplay } from "./useResourceTypeDisplay";
import { MagnetContent } from "../magnet-content/MagnetContent";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useBoard } from "~/providers/BoardProvider";

export const BoardMagnet: FC<BoardMagnetProps> = ({ magnet }) => {
  const { zoomLevel } = useBoard();
  const { user, avatar } = useUser();
  const { icon, type } = useResourceTypeDisplay(magnet.resourceType);
  const time = useElapsedTime(magnet.modificationDate);

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
          {magnet.title}
        </StyledContentTitleTypography>
        {zoomLevel > 1 && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <MagnetContent magnet={magnet} />
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
