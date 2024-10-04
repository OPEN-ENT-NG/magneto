import { FC, useRef, useState } from "react";

import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { Announcements, closestCenter, DndContext, KeyboardCoordinateGetter, KeyboardSensor, MouseSensor, TouchSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { createRange } from "../dnd-components/utilities";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export const CardsFreeLayout: FC = () => {
  const { board, zoomLevel } = useBoard();
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  // const [items, setItems] = useState<UniqueIdentifier[]>(
  //   () =>
  //     board.cards ??
  //     createRange<UniqueIdentifier>(board.cards.map((card: Card) => card._id).length, (index) => index + 1)
  // );
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      // Disable smooth scrolling in Cypress automated tests
      scrollBehavior: 'Cypress' in window ? 'auto' : undefined,
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const getIndex = (id: UniqueIdentifier) => board.cardIds.indexOf(id);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const activeIndex = activeId ? getIndex(activeId) : -1;
  const isFirstAnnouncement = useRef(true);

  const announcements: Announcements = {
    onDragStart({active: {id}}) {
      return `Picked up sortable item ${String(
        id
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        board.cardIds.length
      }`;
    },
    onDragOver({active, over}) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${board.cardIds.length}`;
      }

      return;
    },
    onDragEnd({active, over}) {
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${board.cardIds.length}`;
      }

      return;
    },
    onDragCancel({active: {id}}) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id
      )} of ${board.cardIds.length}.`;
    },
  };

  return (
    <DndContext
      // accessibility={{
      //   announcements,
      // }}
      sensors={sensors}
      collisionDetection={closestCenter}
      // onDragStart={({ active }) => {
      //   if (!active) {
      //     return;
      //   }

      //   setActiveId(active.id);
      // }}
      onDragEnd={({ over }) => {
        // setActiveId(null);

        if (over) {
          // const overIndex = getIndex(over.id);
          // if (activeIndex !== overIndex) {
          //   setItems((board.cardIds) => arrayMove(board.cardIds, activeIndex, overIndex));
          // }
          console.log("dropped");
        }
      }}
      // onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={board.cardIds}>
      <Box sx={mainWrapperProps}>
        {board?.cards ? (
          <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
            {board.cards.map((card: Card, index: number) => {
              return (
                <LiWrapper
                  key={card.id}
                  isLast={index === board.cards.length - 1}
                  zoomLevel={zoomLevel}
                >
                  <BoardCard
                    card={card}
                    zoomLevel={zoomLevel}
                    canComment={board.canComment}
                    displayNbFavorites={board.displayNbFavorites}
                    key={card.id}
                    cardIndex={index}
                  />
                </LiWrapper>
              );
            })}
          </UlWrapper>
        ) : null}
      </Box>
      </SortableContext>
    </DndContext>
  );
};
