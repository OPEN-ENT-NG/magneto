import { FC, useCallback, useRef, useState } from "react";

import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { useFreeLayoutCardDnD } from "~/hooks/dnd-hooks/useFreeLayoutCardDnD";
import { useBoard } from "~/providers/BoardProvider";
import {
  Active,
  Announcements,
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringConfiguration,
  Modifiers,
  MouseSensor,
  PointerActivationConstraint,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createRange } from "../dnd-components/utilities";
import {
  AnimateLayoutChanges,
  arrayMove,
  NewIndexGetter,
  rectSortingStrategy,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";

export interface Props {
  activationConstraint?: PointerActivationConstraint;
  animateLayoutChanges?: AnimateLayoutChanges;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  Container?: any; // To-do: Fix me
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  itemCount?: number;
  items?: string[];
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  renderItem?: any;
  removable?: boolean;
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  style?: React.CSSProperties;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: string;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    active: Pick<Active, "id"> | null;
    index: number;
    isDragging: boolean;
    id: string;
  }): React.CSSProperties;
  isDisabled?(id: string): boolean;
}

export const CardsFreeLayout: FC<Props> = () => {
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
