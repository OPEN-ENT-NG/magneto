import { FC, useEffect, useRef } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Icon from "@mdi/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import StarBorderIcon from "@mui/icons-material/StarBorder";

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
  StyledLegendTypography,
  CardContentWrapper,
  StyledBox,
  Simple14Typography,
  BottomIconButton,
  StyledTypographyContainer,
} from "./style";
import { BoardCardProps } from "./types";
import { useCardDropDownItems } from "./useCardDropDownItems";
import { useResourceTypeDisplay } from "./useResourceTypeDisplay";
import { CardComment } from "../card-comment/CardComment";
import { CardContent } from "../card-content/CardContent";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../drop-down-list/useDropDown";
import { Tooltip } from "../tooltip/Tooltip";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import useDirectory from "~/hooks/useDirectory";
import { useElapsedTime } from "~/hooks/useElapsedTime";

export const BoardCard: FC<BoardCardProps> = ({
  card,
  zoomLevel,
  canComment = false,
  displayNbFavorites = false,
}) => {
  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const time = useElapsedTime(card.modificationDate);
  const { openDropdownId, registerDropdown, toggleDropdown, closeDropdown } =
    useDropdown();
  const dropDownItemList = useCardDropDownItems();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = openDropdownId === card.id;
  const { getAvatarURL } = useDirectory();
  const handleToggleDropdown = () => {
    if (card.id) {
      toggleDropdown(card.id);
    }
  };

  useEffect(() => {
    registerDropdown(card.id, dropdownRef.current);
  }, [card.id, registerDropdown]);

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: card.id,
    data: {
      type: DND_ITEM_TYPE.CARD,
      card: card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
  };

  useEffect(() => {
    registerDropdown(card.id, dropdownRef.current);
  }, [card.id, registerDropdown]);

  useEffect(() => {
    if (isDragging) return closeDropdown();
  }, [isDragging]);

  return (
    <StyledCard
      data-dropdown-open={isOpen ? "true" : "false"}
      data-type={DND_ITEM_TYPE.CARD}
      zoomLevel={zoomLevel}
      isDragging={isDragging}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <StyledCardHeader
        ref={dropdownRef}
        avatar={
          <StyledAvatar
            aria-label="recipe"
            src={getAvatarURL(card.ownerId, "user")}
          />
        }
        action={
          <StyledIconButton
            aria-label="settings"
            onClick={handleToggleDropdown}
          >
            <MoreVertIcon />
          </StyledIconButton>
        }
        title={card.ownerName}
        subheader={
          <Tooltip title={time.tooltip} placement="bottom-start">
            <StyledTypographySubheader>{time.label}</StyledTypographySubheader>
          </Tooltip>
        }
      />
      <StyledCardContent>
        <StyledContentTitleTypography zoomLevel={zoomLevel}>
          {card.title || <span>&nbsp;</span>}
        </StyledContentTitleTypography>
        {zoomLevel > 1 && (
          <CardContentWrapper resourceType={card.resourceType}>
            <CardContent card={card} />
          </CardContentWrapper>
        )}
      </StyledCardContent>
      <StyledCardActions zoomLevel={zoomLevel} disableSpacing>
        <StyledTypographyContainer>
          <StyledTypography>
            <Icon path={icon} size={1} />
            {type}
          </StyledTypography>
          {zoomLevel > 1 && (
            <Tooltip title={card.caption}>
              <StyledLegendTypography>{card.caption}</StyledLegendTypography>
            </Tooltip>
          )}
        </StyledTypographyContainer>
        <StyledBox>
          {displayNbFavorites && (
            <Simple14Typography>{card.nbOfFavorites}</Simple14Typography>
          )}
          <BottomIconButton aria-label="add to favorites" size="small">
            <StarBorderIcon />
          </BottomIconButton>
        </StyledBox>
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
