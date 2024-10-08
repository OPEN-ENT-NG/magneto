import { FC, useCallback, useRef, useState } from "react";

import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { Card } from "~/models/card.model";
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
  // const getPosition = (id: string) => getIndex(id) + 1;
  // const getIndex = (id: string) => board.cardIds.indexOf(id);

  const [items, setItems] = useState<string[]>(
    () =>
      board.cardIds ??
      createRange<string>(board.cards.length, (index) => index + 1),
  );
  const [activeItem, setActiveItem] = useState<Card | null>(null);
  const sensors = useSensors(useSensor(MouseSensor));

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveItem(
      board.cards.find(
        (card: Card) => card._id == event.active.id.toString(),
      ) ?? null,
    );
  }, []);
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id.toString());
        const newIndex = items.indexOf(over!.id.toString());

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveItem(null);
  }, []);
  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={board.cardIds} strategy={rectSortingStrategy}>
        <Box sx={mainWrapperProps}>
          {board?.cards ? (
            <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
              {board.cards.map((card: Card, index: number) => {
                return (
                  <LiWrapper
                    isLast={index === board.cards.length - 1}
                    zoomLevel={zoomLevel}
                  >
                    <BoardCard
                      card={card}
                      zoomLevel={zoomLevel}
                      canComment={board.canComment}
                      displayNbFavorites={board.displayNbFavorites}
                      key={card}
                      id={card}
                      cardIndex={index}
                    />
                  </LiWrapper>
                );
              })}
            </UlWrapper>
          ) : null}
        </Box>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
        {activeItem ? (
          <BoardCard
            card={activeItem}
            zoomLevel={zoomLevel}
            canComment={board.canComment}
            displayNbFavorites={board.displayNbFavorites}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
