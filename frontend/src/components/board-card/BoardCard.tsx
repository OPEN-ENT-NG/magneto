import { FC, useMemo, useEffect, memo } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";

import { getTransformStyle, StyledCard } from "./style";
import { BoardCardProps } from "./types";
import { useCardDropDownItems } from "./useCardDropDownItems";
import { CardActions } from "../card-actions/CardActions";
import { CardCardContent } from "../card-card-content/CardCardContent";
import { CardComment } from "../card-comment/CardComment";
import { CardHeader } from "../card-header/CardHeader";
import { CardModals } from "../card-modals/CardModals";
import { DropDownList } from "../drop-down-list/DropDownList";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import { useBoardCard } from "~/hooks/useBoardCard";
import { useBoard } from "~/providers/BoardProvider";

const BoardCard: FC<BoardCardProps> = ({
  card,
  zoomLevel,
  canComment = false,
  displayNbFavorites = false,
  readOnly = false,
}) => {
  const {
    icon,
    type,
    isOpen,
    isActiveCardId,
    isOwnerOrManager,
    dropdownRef,
    getAvatarURL,
    lockOrUnlockMagnet,
    deleteMagnet,
    handleToggleDropdown,
    handleDropdownClose,
    handleFavoriteClick,
    registerDropdown,
    closeDropdown,
  } = useBoardCard(card);

  const { t } = useTranslation("magneto");
  const { displayModals, closeActiveCardAction } = useBoard();

  const dropDownItemList = useCardDropDownItems(
    readOnly,
    card.locked,
    lockOrUnlockMagnet,
    card,
    isOwnerOrManager,
  );

  const sortableProps = useSortable({
    id: card.id,
    data: { type: DND_ITEM_TYPE.CARD, card },
    disabled: readOnly,
  });

  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = sortableProps;

  const style = useMemo(
    () => getTransformStyle(transform, transition, listeners),
    [transform, transition, listeners],
  );

  const headerProps = {
    avatarUrl: getAvatarURL(card.ownerId, "user"),
    ownerName: card.ownerName,
    modificationDate: card.modificationDate,
    onToggleDropdown: handleToggleDropdown,
    isLocked: card.locked,
  };

  const contentProps = {
    title: card.title,
    zoomLevel,
    resourceType: card.resourceType,
    card,
  };

  const actionProps = {
    cardIsLiked: card.liked,
    zoomLevel,
    icon,
    type,
    caption: card.caption,
    nbOfFavorites: card.nbOfFavorites,
    displayNbFavorites,
    handleFavoriteClick,
  };

  const modalProps = {
    ressourceType: card.resourceType,
    isActiveCardId,
    displayModals,
    deleteMagnet,
    closeActiveCardAction,
    t,
  };

  const commentData = {
    cardComment: card.lastComment,
    nbOfComment: card.nbOfComments,
    cardId: card.id,
  };

  useEffect(() => {
    registerDropdown(card.id, dropdownRef.current);
  }, [card.id, registerDropdown]);

  useEffect(() => {
    if (isDragging) closeDropdown();
  }, [isDragging, closeDropdown]);

  return (
    <StyledCard
      data-dropdown-open={isOpen ? "true" : "false"}
      data-type={DND_ITEM_TYPE.CARD}
      zoomLevel={zoomLevel}
      isDragging={isDragging}
      ref={setNodeRef}
      style={style}
      {...(readOnly ? {} : { ...attributes, ...listeners })}
    >
      <div ref={dropdownRef}>
        <CardHeader {...headerProps} />
      </div>
      <CardCardContent {...contentProps} />
      <CardActions {...actionProps} />

      <CardModals {...modalProps} />

      {isOpen && dropdownRef.current && (
        <DropDownList
          items={dropDownItemList}
          onClose={handleDropdownClose}
          open={isOpen}
          anchorEl={dropdownRef.current}
          position="right-top"
        />
      )}

      {canComment && zoomLevel > 1 && <CardComment commentData={commentData} />}
    </StyledCard>
  );
};

BoardCard.displayName = "BoardCard";

const MemoizedBoardCard = memo(BoardCard, (prev, next) => {
  if (
    prev.zoomLevel !== next.zoomLevel ||
    prev.canComment !== next.canComment ||
    prev.displayNbFavorites !== next.displayNbFavorites ||
    prev.readOnly !== next.readOnly
  ) {
    return false;
  }

  const prevCard = prev.card;
  const nextCard = next.card;

  return (
    prevCard.id === nextCard.id &&
    prevCard.liked === nextCard.liked &&
    prevCard.modificationDate === nextCard.modificationDate &&
    prevCard.locked === nextCard.locked &&
    prevCard.lastComment === nextCard.lastComment &&
    prevCard.nbOfComments === nextCard.nbOfComments &&
    prevCard.nbOfFavorites === nextCard.nbOfFavorites
  );
});

export default MemoizedBoardCard;
