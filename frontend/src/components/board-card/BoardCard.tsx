import { FC, useEffect, useRef } from "react";

import { useUser } from "@edifice-ui/react";
import Icon from "@mdi/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Box, Tooltip } from "@mui/material";
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
  cardContentWrapper,
} from "./style";
import { BoardCardProps } from "./types";
import { useCardDropDownItems } from "./useCardDropDownItems";
import { useResourceTypeDisplay } from "./useResourceTypeDisplay";
import { CardContent } from "../card-content/CardContent";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../section-name/useDropDown";
import { useElapsedTime } from "~/hooks/useElapsedTime";

export const BoardCard: FC<BoardCardProps> = ({ card, zoomLevel }) => {
  const { user, avatar } = useUser();
  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const { openDropdownId, registerDropdown, toggleDropdown } = useDropdown();
  const dropDownItemList = useCardDropDownItems();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const time = useElapsedTime(card.modificationDate);

  const handleToggleDropdown = () => {
    toggleDropdown(card.id);
  };

  useEffect(() => {
    registerDropdown(card.id, dropdownRef.current);
  }, [card.id, registerDropdown]);

  const isOpen = openDropdownId === card.id;

  return (
    <StyledCard zoomLevel={zoomLevel}>
      <StyledCardHeader
        zoomLevel={zoomLevel}
        avatar={<StyledAvatar aria-label="recipe" src={avatar} />}
        action={
          <StyledIconButton
            aria-label="settings"
            onClick={handleToggleDropdown}
          >
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
          <Box sx={cardContentWrapper}>
            <CardContent card={card} />
          </Box>
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
      {isOpen && (
        <DropDownList
          items={dropDownItemList}
          onClose={() => toggleDropdown(null)}
        />
      )}
    </StyledCard>
  );
};
