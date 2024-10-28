import { FC } from "react";

import { DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardWrapper,
  CardsWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { DndSection } from "../dnd-section/DndSection";
import { SectionName } from "../section-name/SectionName";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import { useSectionsDnD } from "~/hooks/dnd-hooks/useSectionsDnD";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();
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
              sectionType="vertical"
              sectionNumber={
                hasEditRights()
                  ? updatedSections.length + 1
                  : updatedSections.length
              }
            >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={section} />
              </Box>
              <CardsWrapper zoomLevel={zoomLevel}>
                <SortableContext
                  items={section.cardIds}
                  strategy={rectSortingStrategy}
                >
                  {section.cards.map((card: Card) => (
                    <CardWrapper key={card.id}>
                      <BoardCard
                        card={card}
                        zoomLevel={zoomLevel}
                        canComment={board.canComment}
                        displayNbFavorites={board.displayNbFavorites}
                      />
                    </CardWrapper>
                  ))}
                </SortableContext>
              </CardsWrapper>
            </DndSection>
          ))}
          {hasEditRights() && (
            <DndSection
              sectionNumber={updatedSections.length + 1}
              isLast={true}
              noCards={true}
              sectionType="vertical"
              id="new-section"
              data-type={DND_ITEM_TYPE.NON_DRAGGABLE}
            >
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={null} />
              </Box>
              <CardsWrapper zoomLevel={zoomLevel}>
                {newMagnetOver.map((card: Card) => (
                  <CardWrapper key={card.id}>
                    <BoardCard
                      card={card}
                      zoomLevel={zoomLevel}
                      canComment={board.canComment}
                      displayNbFavorites={board.displayNbFavorites}
                    />
                  </CardWrapper>
                ))}
              </CardsWrapper>
            </DndSection>
          )}
        </Box>
      </SortableContext>
      <DragOverlay>
        {activeItem &&
          ("cards" in activeItem ? (
            <SectionWrapper isLast={true} key={activeItem._id}>
              <Box sx={sectionNameWrapperStyle}>
                <SectionName section={activeItem} />
              </Box>
              <CardsWrapper zoomLevel={zoomLevel} isDragging={true}>
                {activeItem.cards.map((card: Card) => (
                  <CardWrapper key={card.id}>
                    <BoardCard
                      card={card}
                      zoomLevel={zoomLevel}
                      canComment={board.canComment}
                      displayNbFavorites={board.displayNbFavorites}
                    />
                  </CardWrapper>
                ))}
              </CardsWrapper>
            </SectionWrapper>
          ) : (
            <CardWrapper>
              <BoardCard
                card={activeItem as Card}
                zoomLevel={zoomLevel}
                canComment={board.canComment}
                displayNbFavorites={board.displayNbFavorites}
              />
            </CardWrapper>
          ))}
      </DragOverlay>
    </DndContext>
  );
};
