import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardWrapper,
  CardsWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { useSectionsDnD } from "~/hooks/dnd-hooks/useSectionsDnD";
import { Card } from "~/models/card.model";

export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();
  const {
    updatedIds,
    activeItem,
    sectionMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useSectionsDnD(board);

  if (!board.sections?.length) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={updatedIds}
        strategy={horizontalListSortingStrategy}
      >
        <Box sx={mainWrapperProps}>
          {updatedIds.map((sectionId: string) => {
            const section = sectionMap[sectionId];

            const {
              isDragging,
              attributes,
              listeners,
              setNodeRef,
              transform,
              transition,
            } = useSortable({ id: section._id });

            const style = {
              transform: CSS.Transform.toString(transform),
              transition: transition || undefined,
            };

            return (
            <SectionWrapper
              key={sectionId}
              sectionNumber={
                hasEditRights()
                  ? board.sections.length + 1
                  : board.sections.length
              }
              isDragging={isDragging}
              ref={setNodeRef}
              style={style}

            >
              <Box sx={sectionNameWrapperStyle}               
              {...attributes}
              {...listeners} >
                <SectionName section={section} />
              </Box>
              <CardsWrapper zoomLevel={zoomLevel}>
                {section.cards.map((card: Card) => (
                  <CardWrapper key={card.id}>
                    <BoardCard
                      card={card}
                      zoomLevel={zoomLevel}
                      canComment={board.canComment}
                      displayNbFavorites={board.displayNbFavorites}
                      key={card.id}
                    />
                  </CardWrapper>
                ))}
              </CardsWrapper>
            </SectionWrapper>);
          })}
          {/* new section */}
          {hasEditRights() && (
            <SectionWrapper
              sectionNumber={board.sections.length + 1}
              isLast={true} >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={null} />
              </Box>
            </SectionWrapper>
          )}
        </Box>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <SectionWrapper
            key={activeItem._id}
            sectionNumber={
              hasEditRights()
                ? board.sections.length + 1
                : board.sections.length
            }
          >
            <Box sx={sectionNameWrapperStyle}>
              <SectionName section={activeItem} />
            </Box>
            <CardsWrapper zoomLevel={zoomLevel}>
              {activeItem.cards.map((card: Card) => (
                <CardWrapper key={card.id}>
                  <BoardCard
                    card={card}
                    zoomLevel={zoomLevel}
                    canComment={board.canComment}
                    displayNbFavorites={board.displayNbFavorites}
                    key={card.id}
                  />
                </CardWrapper>
              ))}
            </CardsWrapper>
          </SectionWrapper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
