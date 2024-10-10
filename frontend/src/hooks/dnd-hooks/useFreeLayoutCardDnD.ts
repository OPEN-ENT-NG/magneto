import { useState, useCallback, useMemo, useEffect } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  PointerSensorOptions,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { useUpdateBoardMutation } from "~/services/api/boards.service";

export class CustomPointerSensor extends PointerSensor {
    static activators = [
      {
        eventName: 'onPointerDown' as const,
        handler: (event: React.PointerEvent, { onActivation }: PointerSensorOptions): boolean => {
          if (!(event.target instanceof Element)) {
            return false;
          }
  
          // Vérifier si un menu déroulant est ouvert
          const dropdownOpen = document.querySelector('[data-dropdown-open="true"]');
          if (dropdownOpen) {
            return false;
          }
  
          const shouldActivate = !event.isPrimary || event.button === 0;
          if (shouldActivate) {
            onActivation?.({ event: event.nativeEvent });
          }
  
          return shouldActivate;
        },
      },
    ];
  }

export const useFreeLayoutCardDnG = (board: Board) => {
  const [updatedIds, setUpdatedIds] = useState<string[]>(board.cardIds);
  const [activeItem, setActiveItem] = useState<Card | null>(null);
  const [updateBoard] = useUpdateBoardMutation();

  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    setUpdatedIds(board.cardIds);
  }, [board.cardIds]);

  const cardMap = useMemo(() => {
    return board.cards.reduce(
      (acc, card) => {
        acc[card.id] = card;
        return acc;
      },
      {} as Record<string, Card>,
    );
  }, [board.cards]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveItem(cardMap[event.active.id.toString()] ?? null);
    },
    [cardMap],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = updatedIds.indexOf(active.id.toString());
        const newIndex = updatedIds.indexOf(
          over ? over.id.toString() : updatedIds[updatedIds.length - 1],
        );

        const newUpdatedIds = arrayMove(updatedIds, oldIndex, newIndex);
        setUpdatedIds(newUpdatedIds);

        const payload = {
          id: board._id,
          cardIds: newUpdatedIds,
          layoutType: board.layoutType,
          canComment: board.canComment,
          displayNbFavorites: board.displayNbFavorites,
        };

        try {
          await updateBoard(payload).unwrap();
        } catch (error) {
          console.error("Failed to update board:", error);
          setUpdatedIds(board.cardIds);
        }
      }

      setActiveItem(null);
    },
    [board, updatedIds, updateBoard],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  return {
    updatedIds,
    activeItem,
    cardMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
