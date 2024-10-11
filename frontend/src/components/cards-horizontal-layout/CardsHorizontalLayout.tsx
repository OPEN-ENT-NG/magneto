import { FC } from "react";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import {
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardBoxStyle,
  UlWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { DroppableSection } from "../droppable-section/DroppableSection";
import { SectionName } from "../section-name/SectionName";
import { useCardSectionDnD } from "~/hooks/dnd-hooks/useCardSectionDnd";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const CardsHorizontalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();
  const {
    activeCard,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useCardSectionDnD(board);

  if (!board.sections?.length) return null;

  const allItems = board.sections.flatMap((section) =>
    section.cards.length > 0
      ? section.cards.map((card) => card.id)
      : [section._id],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={allItems} strategy={rectSortingStrategy}>
        <Box sx={mainWrapperProps}>
          {board.sections.map((section) => {
            return (
              <DroppableSection
                id={section._id}
                noCards={!section.cards.length}
              >
                <Box sx={sectionNameWrapperStyle}>
                  <SectionName section={section} />
                </Box>
                <UlWrapper className="grid ps-0 list-unstyled left-float">
                  {section.cards.map((card: Card) => (
                    <CardBoxStyle key={card.id} zoomLevel={zoomLevel}>
                      <BoardCard
                        card={card}
                        zoomLevel={zoomLevel}
                        canComment={board.canComment}
                        displayNbFavorites={board.displayNbFavorites}
                      />
                    </CardBoxStyle>
                  ))}
                </UlWrapper>
              </DroppableSection>
            );
          })}
          {hasEditRights() && (
            <DroppableSection isLast={true} id="new_section">
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={null} />
              </Box>
            </DroppableSection>
          )}
        </Box>
      </SortableContext>
      <DragOverlay>
        {activeCard && (
          <CardBoxStyle zoomLevel={zoomLevel}>
            <BoardCard
              card={activeCard}
              zoomLevel={zoomLevel}
              canComment={board.canComment}
              displayNbFavorites={board.displayNbFavorites}
            />
          </CardBoxStyle>
        )}
      </DragOverlay>
    </DndContext>
  );
};
