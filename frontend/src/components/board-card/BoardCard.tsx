import { FC, useCallback, useEffect, useRef } from "react";

// import { DndContext } from "@dnd-kit/core";
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
import useDirectory from "~/hooks/useDirectory";
import { useElapsedTime } from "~/hooks/useElapsedTime";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { useBoard } from "~/providers/BoardProvider";

export const BoardCard: FC<BoardCardProps> = ({
  card,
  zoomLevel,
  canComment = false,
  displayNbFavorites = false,
  cardIndex,
  sectionIndex,
}) => {
  // const { moveCardsHover } = useBoard();

  const { icon, type } = useResourceTypeDisplay(card.resourceType);
  const time = useElapsedTime(card.modificationDate);
  const { openDropdownId, registerDropdown, toggleDropdown } = useDropdown();
  const dropDownItemList = useCardDropDownItems();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOpen = openDropdownId === card.id;
  const { getAvatarURL } = useDirectory();
  const handleToggleDropdown = () => {
    if (card.id) {
      toggleDropdown(card.id);
    }
  };

  // const ref = useRef<HTMLDivElement>(null);
  // const [{ isDragging }, drag] = useDrag({
  //   type: "card",
  //   item: { card, cardIndex, sectionIndex },
  //   collect: (monitor) => ({
  //     isDragging: !!monitor.isDragging(),
  //   }),
  // });

  // const [{ isOver }, drop] = useDrop({
  //   accept: "card",
  //   // drop: () => setHasDrop(true),
  //   drop: () => console.log("drop"),
  //   collect: (monitor: any) => ({
  //     isOver: !!monitor.isOver(),
  //   }),
  //   hover(item: any, monitor: any) {
  //     if (!ref.current) {
  //       return;
  //     }
  //     const dragIndex = item.cardIndex;
  //     const hoverIndex = cardIndex;

  //     // Don't replace items with themselves
  //     if (dragIndex === hoverIndex) {
  //       return;
  //     }

  //     // Determine rectangle on screen
  //     const hoverBoundingRect = ref.current?.getBoundingClientRect();

  //     // Get vertical middle
  //     const hoverMiddleX =
  //       (hoverBoundingRect.right - hoverBoundingRect.left) / 2;

  //     // Determine mouse position
  //     const clientOffset = monitor.getClientOffset();

  //     // Get pixels to the top
  //     const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;

  //     // Only perform the move when the mouse has crossed half of the items height
  //     // When dragging downwards, only move when the cursor is below 50%
  //     // When dragging upwards, only move when the cursor is above 50%

  //     // Dragging downwards
  //     if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
  //       return;
  //     }

  //     // Dragging upwards
  //     if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
  //       return;
  //     }

  //     // Time to actually perform the action
  //     // moveCard(dragIndex, hoverIndex)
  //     console.log(
  //       "moved",
  //       item.card.id,
  //       dragIndex,
  //       item.sectionIndex,
  //       hoverIndex,
  //       sectionIndex,
  //     );
  //     // todo call move
  //     // moveCardsHover(
  //     //   item.card.id,
  //     //   dragIndex,
  //     //   hoverIndex,
  //     //   item.sectionIndex,
  //     //   sectionIndex,
  //     // );

  //     // Note: we're mutating the monitor item here!
  //     // Generally it's better to avoid mutations,
  //     // but it's good here for the sake of performance
  //     // to avoid expensive index searches.
  //     item.cardIndex = hoverIndex;
  //   },
  // });

  useEffect(() => {
    registerDropdown(card.id, dropdownRef.current);
  }, [card.id, registerDropdown]);

  // drag(drop(ref));

  return (
    // <DndContext>
      <div
        // ref={setNodeRef}
        // // className={`${isDragging ? "dragging" : ""}`}
        // style={style}
      >
        <StyledCard zoomLevel={zoomLevel} ref={dropdownRef}>
          <StyledCardHeader
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
                <StyledTypographySubheader>
                  {time.label}
                </StyledTypographySubheader>
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
                  <StyledLegendTypography>
                    {card.caption}
                  </StyledLegendTypography>
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
      </div>
    // </DndContext>
  );
};
