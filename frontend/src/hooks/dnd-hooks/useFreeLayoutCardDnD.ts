import { useState, useCallback, useMemo, useEffect } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { CustomPointerSensor } from "./customPointer";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { useUpdateBoardMutation } from "~/services/api/boards.service";

/*const getLockedPositions = (
  items: string[],
  lockedItems: Set<string>,
): Map<string, number> => {
  const positions = new Map<string, number>();
  items.forEach((item, index) => {
    if (lockedItems.has(item)) {
      positions.set(item, index);
    }
  });
  return positions;
};

const verifyLockedPositions = (
  items: string[],
  lockedItems: Set<string>,
  originalPositions: Map<string, number>,
): boolean => {
  for (const [item, originalPos] of originalPositions.entries()) {
    const newPos = items.indexOf(item);
    if (newPos !== originalPos) {
      return false;
    }
  }
  return true;
};*/

const reorderWithLockedItems = (
  items: string[],
  oldIndex: number,
  newIndex: number,
  lockedItems: Set<string>,
): string[] => {
  // If the moved item is locked, return original array
  if (lockedItems.has(items[oldIndex])) {
    return items;
  }

  const result = [...items];
  const [movedItem] = result.splice(oldIndex, 1);

  // Moving right to left
  if (oldIndex > newIndex) {
    // Check if we're trying to move to position right after a locked item
    if (lockedItems.has(items[newIndex])) {
      console.log(
        `Attempting to place item ${movedItem} right after locked item ${items[newIndex]}`,
      );

      const lockedIndex = result.indexOf(items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex - 1];
      result.splice(lockedIndex - 1, 1);

      // Insert moved item after original adjacent item
      result.splice(lockedIndex - 1, 0, movedItem);

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
    } else {
      // Insert at the target position
      result.splice(newIndex, 0, movedItem);
    }

    // Push displaced items forward past any locked items
    for (let i = newIndex + 1; i < result.length; i++) {
      if (lockedItems.has(result[i])) {
        // If we hit a locked item, find next available position
        let availablePos = i + 1;
        while (
          availablePos < result.length &&
          lockedItems.has(result[availablePos])
        ) {
          availablePos++;
        }

        if (availablePos < result.length) {
          // Move the displaced item to the available position
          const [itemToMove] = result.splice(i - 1, 1);
          result.splice(availablePos - 1, 0, itemToMove);
        }
      }
    }
  }
  // Moving left to right
  else {
    // Check if we're trying to move to position right after a locked item
    if (lockedItems.has(items[newIndex])) {
      console.log(
        `Attempting to place item ${movedItem} right after locked item ${items[newIndex]}`,
      );

      const lockedIndex = result.indexOf(items[newIndex]);

      // Get and remove the item that was after the locked item
      const itemAfterLocked = result[lockedIndex + 1];
      result.splice(lockedIndex + 1, 1);

      // Insert moved item after original adjacent item
      result.splice(lockedIndex + 1, 0, movedItem);

      // Insert original adjacent item before locked item
      result.splice(lockedIndex, 0, itemAfterLocked);
    } else {
      // Insert at the target position
      result.splice(newIndex, 0, movedItem);
    }

    // Push displaced items backward past any locked items
    for (let i = newIndex - 1; i >= 0; i--) {
      if (lockedItems.has(result[i])) {
        // If we hit a locked item, find next available position
        let availablePos = i - 1;
        while (availablePos >= 0 && lockedItems.has(result[availablePos])) {
          availablePos--;
        }

        if (availablePos >= 0) {
          // Move the displaced item to the available position
          const [itemToMove] = result.splice(i + 1, 1);
          result.splice(availablePos + 1, 0, itemToMove);
        }
      }
    }
  }

  return result;
};

export const useFreeLayoutCardDnD = (board: Board) => {
  const validCardIds = useMemo(() => {
    const cardSet = new Set(board.cards.map((card) => card.id));
    return board.cardIds.filter((id) => cardSet.has(id));
  }, [board.cards, board.cardIds]);

  const [updatedIds, setUpdatedIds] = useState<string[]>(validCardIds);
  const [activeItem, setActiveItem] = useState<Card | null>(null);
  const [updateBoard] = useUpdateBoardMutation();

  const cardMap = useMemo(() => {
    const map: Record<string, Card> = {};
    board.cards.forEach((card) => {
      map[card.id] = card;
    });
    return map;
  }, [board.cards]);

  const lockedCards = useMemo(() => {
    const locked = new Set<string>();
    board.cards.forEach((card) => {
      if (card.locked) {
        locked.add(card.id);
      }
    });
    return locked;
  }, [board.cards]);

  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

  useEffect(() => {
    setUpdatedIds(validCardIds);
  }, [validCardIds]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const cardId = event.active.id.toString();
      const card = cardMap[cardId];

      if (card) {
        setActiveItem(card);
      }
    },
    [cardMap],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      try {
        if (active.id !== over?.id && over) {
          const activeId = active.id.toString();
          const overId = over.id.toString();

          if (!cardMap[activeId]) {
            return;
          }

          const oldIndex = updatedIds.indexOf(activeId);
          const newIndex = updatedIds.indexOf(overId);

          if (oldIndex === -1) {
            return;
          }

          const newUpdatedIds = reorderWithLockedItems(
            updatedIds,
            oldIndex,
            newIndex,
            lockedCards,
          );

          setUpdatedIds(newUpdatedIds);

          const payload = {
            id: board._id,
            cardIds: newUpdatedIds,
            layoutType: board.layoutType,
            canComment: board.canComment,
            displayNbFavorites: board.displayNbFavorites,
          };

          await updateBoard(payload).unwrap();
        }
      } catch {
        setUpdatedIds(validCardIds);
      } finally {
        setActiveItem(null);
      }
    },
    [board, updatedIds, updateBoard, cardMap, validCardIds, lockedCards],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  const safeUpdatedIds = useMemo(() => {
    return updatedIds.filter((id) => cardMap[id]);
  }, [updatedIds, cardMap]);

  return {
    updatedIds: safeUpdatedIds,
    activeItem,
    cardMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
