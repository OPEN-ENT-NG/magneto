import { FC, memo, useMemo, useCallback } from "react";

import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import BoardCard from "../board-card/BoardCard";
import { CardDisplayProps } from "../cards-vertical-layout/types";
import { useFreeLayoutCardDnD } from "~/hooks/dnd-hooks/useFreeLayoutCardDnD";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

const MemoizedBoardCard = memo(BoardCard);

const MemoizedCardItem = memo(
  ({
    cardId,
    card,
    displayProps,
    index,
    totalCards,
    hasEditRights,
  }: {
    cardId: string;
    card: Card;
    displayProps: CardDisplayProps;
    index: number;
    totalCards: number;
    hasEditRights: boolean;
  }) => (
    <LiWrapper
      key={cardId}
      isLast={index === totalCards - 1}
      zoomLevel={displayProps.zoomLevel}
    >
      <MemoizedBoardCard
        card={card}
        zoomLevel={displayProps.zoomLevel}
        canComment={displayProps.canComment}
        displayNbFavorites={displayProps.displayNbFavorites}
        readOnly={hasEditRights}
      />
    </LiWrapper>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.cardId === nextProps.cardId &&
      prevProps.index === nextProps.index &&
      prevProps.totalCards === nextProps.totalCards &&
      prevProps.displayProps.zoomLevel === nextProps.displayProps.zoomLevel &&
      prevProps.displayProps.canComment === nextProps.displayProps.canComment &&
      prevProps.card.lastComment === nextProps.card.lastComment &&
      prevProps.card.nbOfComments === nextProps.card.nbOfComments &&
      prevProps.displayProps.displayNbFavorites ===
        nextProps.displayProps.displayNbFavorites
    );
  },
);

const MemoizedDragOverlay = memo(
  ({
    activeItem,
    displayProps,
  }: {
    activeItem: Card | null;
    displayProps: CardDisplayProps;
  }) => {
    const { hasEditRights } = useBoard();
    if (!activeItem) return null;

    return (
      <MemoizedBoardCard
        card={activeItem}
        zoomLevel={displayProps.zoomLevel}
        canComment={displayProps.canComment}
        displayNbFavorites={displayProps.displayNbFavorites}
        readOnly={hasEditRights()}
      />
    );
  },
);

export const CardsFreeLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();
  const {
    updatedIds,
    updatedIdsWithoutLocked,
    activeItem,
    cardMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useFreeLayoutCardDnD(board);
  const displayProps = useMemo(
    () => ({
      zoomLevel,
      canComment: board.canComment,
      displayNbFavorites: board.displayNbFavorites,
    }),
    [zoomLevel, board.canComment, board.displayNbFavorites],
  );

  const memoizedHandleDragStart = useCallback(handleDragStart, [
    handleDragStart,
  ]);
  const memoizedHandleDragEnd = useCallback(handleDragEnd, [handleDragEnd]);
  const memoizedHandleDragCancel = useCallback(handleDragCancel, [
    handleDragCancel,
  ]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={memoizedHandleDragStart}
      onDragEnd={memoizedHandleDragEnd}
      onDragCancel={memoizedHandleDragCancel}
    >
      <SortableContext
        items={updatedIdsWithoutLocked}
        strategy={rectSortingStrategy}
      >
        <Box sx={mainWrapperProps}>
          <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
            {updatedIds.map((cardId, index) => (
              <MemoizedCardItem
                key={cardId}
                cardId={cardId}
                card={cardMap[cardId]}
                displayProps={displayProps}
                index={index}
                totalCards={updatedIds.length}
                hasEditRights={!hasEditRights()}
              />
            ))}
          </UlWrapper>
        </Box>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
        <MemoizedDragOverlay
          activeItem={activeItem}
          displayProps={displayProps}
        />
      </DragOverlay>
    </DndContext>
  );
};
