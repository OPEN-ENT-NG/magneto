import { FC } from "react";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardBoxStyle,
  UlWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { DndSection } from "../dnd-section/DndSection";
import { SectionName } from "../section-name/SectionName";
import { useSectionsDnD } from "~/hooks/dnd-hooks/useSectionsDnD";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const CardsHorizontalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();
  const {
    activeItem,
    updatedSections,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useSectionsDnD(board);

  if (!updatedSections.length) return null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        items={updatedSections.map((section) => section._id)}
        strategy={rectSortingStrategy}
      >
        <Box sx={mainWrapperProps}>
          {updatedSections.map((section) => (
            <DndSection
              key={section._id}
              id={section._id}
              noCards={!section.cards.length}
              sectionType="horizontal"
              sectionNumber={
                hasEditRights()
                  ? updatedSections.length + 1
                  : updatedSections.length
              }
            >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={section} />
              </Box>
              <UlWrapper className="grid ps-0 list-unstyled left-float">
                <SortableContext
                  items={section.cardIds}
                  strategy={rectSortingStrategy}
                >
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
                </SortableContext>
              </UlWrapper>
            </DndSection>
          ))}
          {hasEditRights() && (
            <DndSection
              sectionNumber={updatedSections.length + 1}
              isLast={true}
              noCards={true}
              sectionType="horizontal"
              id="new-section"
            >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={null} />
              </Box>
            </DndSection>
          )}
        </Box>
      </SortableContext>
      <DragOverlay>
        {activeItem &&
          ("cards" in activeItem ? (
            <SectionWrapper key={activeItem._id}>
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={activeItem} />
              </Box>
              <UlWrapper className="grid ps-0 list-unstyled left-float">
                {activeItem.cards.map((card: Card) => (
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
            </SectionWrapper>
          ) : (
            <CardBoxStyle zoomLevel={zoomLevel}>
              <BoardCard
                card={activeItem as Card}
                zoomLevel={zoomLevel}
                canComment={board.canComment}
                displayNbFavorites={board.displayNbFavorites}
              />
            </CardBoxStyle>
          ))}
      </DragOverlay>
    </DndContext>
  );
};
