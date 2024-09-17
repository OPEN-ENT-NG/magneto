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
  cardContentWrapperStyle,
} from "./style";
import { BoardCardProps } from "./types";
import { useCardDropDownItems } from "./useCardDropDownItems";
import { useResourceTypeDisplay } from "./useResourceTypeDisplay";
import { CardComment } from "../card-comment/CardComment";
import { CardContent } from "../card-content/CardContent";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../section-name/useDropDown";
import { useElapsedTime } from "~/hooks/useElapsedTime";

export const BoardCard: FC<BoardCardProps> = ({
  card,
  zoomLevel,
  canComment = false,
}) => {
  const { user, avatar } = useUser();
  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const time = useElapsedTime(card.modificationDate);
  const { openDropdownId, registerDropdown, toggleDropdown } = useDropdown();
  const dropDownItemList = useCardDropDownItems();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = openDropdownId === card.id;
  const handleToggleDropdown = () => {
    if (card.id) {
      toggleDropdown(card.id);
    }
  };

  useEffect(() => {
    registerDropdown(card.id, dropdownRef.current);
  }, [card.id, registerDropdown]);

  return (
    <StyledCard zoomLevel={zoomLevel} ref={dropdownRef}>
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
          <Box sx={cardContentWrapperStyle}>
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
      {isOpen && dropdownRef.current && (
        <DropDownList
          items={dropDownItemList}
          onClose={() => toggleDropdown(null)}
          open={isOpen}
          anchorEl={dropdownRef.current}
          position="right-top"
        />
      )}
      {canComment && zoomLevel > 1 && (
        <CardComment
          commentData={{
            cardComment: card.lastComment,
            nbOfComment: card.nbOfComments,
            cardId: card.id,
          }}
        />
      )}
    </StyledCard>
  );
};
