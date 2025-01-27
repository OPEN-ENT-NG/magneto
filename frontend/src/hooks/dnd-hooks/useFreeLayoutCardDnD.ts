import { useState, useCallback, useMemo, useEffect } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { CustomPointerSensor } from "./customPointer";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { useUpdateBoardMutation } from "~/services/api/boards.service";

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

          const newUpdatedIds = arrayMove(updatedIds, oldIndex, newIndex);
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
    [board, updatedIds, updateBoard, cardMap, validCardIds],
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
