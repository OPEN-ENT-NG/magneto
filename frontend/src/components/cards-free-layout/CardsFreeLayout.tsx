import { FC } from "react";

import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { useFreeLayoutCardDnD } from "./useFreeLayoutCardDnD";
import { BoardCard } from "../board-card/BoardCard";
import { useBoard } from "~/providers/BoardProvider";

export const CardsFreeLayout: FC = () => {
  const { board, zoomLevel } = useBoard();
  const {
    updatedIds,
    activeItem,
    cardMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useFreeLayoutCardDnD(board);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={updatedIds} strategy={rectSortingStrategy}>
        <Box sx={mainWrapperProps}>
          <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
            {updatedIds.map((cardId, index) => {
              const card = cardMap[cardId];
              return (
                <LiWrapper
                  key={cardId}
                  isLast={index === updatedIds.length - 1}
                  zoomLevel={zoomLevel}
                >
                  <BoardCard
                    card={card}
                    zoomLevel={zoomLevel}
                    canComment={board.canComment}
                    displayNbFavorites={board.displayNbFavorites}
                  />
                </LiWrapper>
              );
            })}
          </UlWrapper>
        </Box>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
        {activeItem ? (
          <BoardCard
            card={activeItem}
            zoomLevel={zoomLevel}
            canComment={board.canComment}
            displayNbFavorites={board.displayNbFavorites}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
