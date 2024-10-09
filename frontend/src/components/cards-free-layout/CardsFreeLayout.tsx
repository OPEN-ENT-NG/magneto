import { FC, useCallback, useRef, useState } from "react";

import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import {
  Active,
  closestCenter,
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardCoordinateGetter,
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
import { useUpdateBoardMutation } from "~/services/api/boards.service";
import { BoardForm } from "~/models/board.model";

export interface Props {
  //todo externalize
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
  const [updateBoard] = useUpdateBoardMutation();
  // const getPosition = (id: string) => getIndex(id) + 1;
  // const getIndex = (id: string) => board.cardIds.indexOf(id);

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

    if (active.id !== over?.id) { // todo call back
      let updatedCardIds: string[] = [...board.cardIds];
      const oldIndex: number = updatedCardIds.indexOf(active.id.toString());
      const newIndex: number = updatedCardIds.indexOf(over ? over.id.toString() : board.cardIds.length.toString());
      arrayMove(updatedCardIds, oldIndex, newIndex);
      // updatedCardIds.splice(oldIndex, 1);
      // updatedCardIds.splice(newIndex, 0, active.id);

      let test = {
        id: board._id,
        // "cardIds":["acb68766-9e46-418d-a98a-3d15591eb76c","7fecfced-3353-4c6e-95fc-fc9cd70a9cce","370da145-f347-45e0-876d-15f0f396d6e5","8881d9de-6920-4879-9f58-675cdfc8d461","4a81828c-abe2-415f-8404-719f358c7625","376fa86c-c226-4440-a4bf-8edf47a0e23d","02ea0335-f4be-48fe-b4c3-c6f868722e33","0cbfe84b-55bc-41c5-af5b-2382ceb19e3e","9199eaa4-4ed5-4b52-b9ea-fa7967cd3780"],
        cardIds: updatedCardIds,
        layoutType: board.layoutType,
        canComment: board.canComment,
        displayNbFavorites: board.displayNbFavorites,
      };

      const updatedBoard: BoardForm = new BoardForm().build(board);
      console.log("updatedBoard", board);
      console.log("formatted updatedBoard", updatedBoard);
      updateBoard(test);
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
                    key={Date.now() + index}
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
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
