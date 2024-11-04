import { FC, memo, useMemo, useCallback } from "react";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import {
  CardWrapper,
  CardsWrapper,
  sectionNameWrapperStyle,
  SectionWrapper,
  mainWrapperProps,
} from "./style";
import { CardDisplayProps } from "./types";
import { BoardCard } from "../board-card/BoardCard";
import { DndSection } from "../dnd-section/DndSection";
import { SectionName } from "../section-name/SectionName";
import { ActiveItemState, DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import useSectionsDnD from "~/hooks/dnd-hooks/useSectionsDnD";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";

const MemoizedBoardCard = memo(BoardCard);

const MemoizedCardWrapper = memo(
  ({
    card,
    displayProps,
    hasEditRights,
  }: {
    card: Card;
    displayProps: CardDisplayProps;
    hasEditRights: boolean;
  }) => (
    <CardWrapper>
      <MemoizedBoardCard
        card={card}
        zoomLevel={displayProps.zoomLevel}
        canComment={displayProps.canComment}
        displayNbFavorites={displayProps.displayNbFavorites}
        readOnly={!hasEditRights}
      />
    </CardWrapper>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.displayProps.zoomLevel === nextProps.displayProps.zoomLevel &&
      prevProps.displayProps.canComment === nextProps.displayProps.canComment &&
      prevProps.card.lastComment === nextProps.card.lastComment &&
      prevProps.card.nbOfComments === nextProps.card.nbOfComments &&
      prevProps.displayProps.displayNbFavorites ===
        nextProps.displayProps.displayNbFavorites &&
      prevProps.hasEditRights === nextProps.hasEditRights
    );
  },
);

const MemoizedCardsSection = memo(
  ({
    cards,
    cardIds,
    displayProps,
    hasEditRights,
  }: {
    cards: Card[];
    cardIds: string[];
    displayProps: CardDisplayProps;
    hasEditRights: boolean;
  }) => (
    <CardsWrapper zoomLevel={displayProps.zoomLevel}>
      <SortableContext items={cardIds} strategy={rectSortingStrategy}>
        {cards.map((card: Card) => (
          <MemoizedCardWrapper
            key={card.id}
            card={card}
            displayProps={displayProps}
            hasEditRights={hasEditRights}
          />
        ))}
      </SortableContext>
    </CardsWrapper>
  ),
);

const MemoizedSection = memo(
  ({
    section,
    sectionNumber,
    displayProps,
    hasEditRights,
    hasManageRights,
    isLast = false,
    isDraggable = true,
  }: {
    section: Section;
    sectionNumber: number;
    displayProps: CardDisplayProps;
    hasEditRights: boolean;
    hasManageRights: boolean;
    isLast?: boolean;
    isDraggable?: boolean;
  }) => (
    <DndSection
      id={section._id}
      noCards={!section.cards.length}
      sectionType="vertical"
      sectionNumber={sectionNumber}
      isLast={isLast}
      data-type={!isDraggable ? DND_ITEM_TYPE.NON_DRAGGABLE : undefined}
      readOnly={!hasManageRights}
    >
      <Box sx={sectionNameWrapperStyle}>
        <SectionName section={section} />
      </Box>
      <MemoizedCardsSection
        cards={section.cards}
        cardIds={section.cardIds}
        displayProps={displayProps}
        hasEditRights={hasEditRights}
      />
    </DndSection>
  ),
);
const MemoizedDragOverlay = memo(
  ({
    activeItem,
    displayProps,
    hasEditRights,
  }: {
    activeItem: ActiveItemState;
    displayProps: CardDisplayProps;
    hasEditRights: boolean;
  }) => {
    if (!activeItem) return null;

    if ("cards" in activeItem) {
      return (
        <SectionWrapper isLast={true}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={activeItem} />
          </Box>
          <CardsWrapper zoomLevel={displayProps.zoomLevel} isDragging={true}>
            {activeItem.cards.map((card: Card) => (
              <MemoizedCardWrapper
                key={card.id}
                card={card}
                displayProps={displayProps}
                hasEditRights={hasEditRights}
              />
            ))}
          </CardsWrapper>
        </SectionWrapper>
      );
    }

    return (
      <MemoizedCardWrapper
        card={activeItem as Card}
        displayProps={displayProps}
        hasEditRights={hasEditRights}
      />
    );
  },
);
export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights, hasManageRights } = useBoard();
  const {
    activeItem,
    updatedSections,
    sensors,
    newMagnetOver,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useSectionsDnD(board);

  const memoizedHandleDragStart = useCallback(handleDragStart, [
    handleDragStart,
  ]);

  const memoizedHandleDragOver = useCallback(handleDragOver, [handleDragOver]);

  const memoizedHandleDragEnd = useCallback(handleDragEnd, [handleDragEnd]);

  const memoizedHandleDragCancel = useCallback(handleDragCancel, [
    handleDragCancel,
  ]);

  const sectionIds = useMemo(
    () => updatedSections.map((section) => section._id),
    [updatedSections],
  );

  const displayProps = useMemo(
    () => ({
      zoomLevel,
      canComment: board.canComment,
      displayNbFavorites: board.displayNbFavorites,
    }),
    [zoomLevel, board.canComment, board.displayNbFavorites],
  );

  const sectionCount = useMemo(() => updatedSections.length, [updatedSections]);

  const editRightsSection = useMemo(
    () => ({
      _id: "new-section",
      cards: newMagnetOver,
      cardIds: newMagnetOver.map((card) => card.id),
    }),
    [newMagnetOver],
  );

  const sectionNumber = useMemo(
    () => (hasEditRights() ? sectionCount + 1 : sectionCount),
    [hasEditRights, sectionCount],
  );

  if (!updatedSections.length) return null;
  console.log(updatedSections[0].cardIds.length);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={memoizedHandleDragStart}
      onDragOver={memoizedHandleDragOver}
      onDragEnd={memoizedHandleDragEnd}
      onDragCancel={memoizedHandleDragCancel}
    >
      <SortableContext items={sectionIds} strategy={rectSortingStrategy}>
        <Box sx={mainWrapperProps}>
          {updatedSections.map((section) => (
            <MemoizedSection
              key={section._id}
              section={section}
              sectionNumber={sectionNumber}
              displayProps={displayProps}
              hasEditRights={hasEditRights()}
              hasManageRights={hasManageRights()}
            />
          ))}

          {hasEditRights() && (
            <MemoizedSection
              section={editRightsSection as Section}
              sectionNumber={sectionCount + 1}
              displayProps={displayProps}
              hasEditRights={hasEditRights()}
              hasManageRights={hasManageRights()}
              isLast={true}
              isDraggable={false}
            />
          )}
        </Box>
      </SortableContext>

      <DragOverlay>
        <MemoizedDragOverlay
          activeItem={activeItem}
          displayProps={displayProps}
          hasEditRights={hasEditRights()}
        />
      </DragOverlay>
    </DndContext>
  );
};
