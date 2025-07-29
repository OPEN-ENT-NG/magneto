import { useState, useCallback, useMemo, useEffect } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { CustomPointerSensor } from "./customPointer";
import { reorderWithLockedItems } from "./reorderUtils";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import { useUpdateBoardCardsMutation } from "~/services/api/boards.service";

export const useFreeLayoutCardDnD = (board: Board) => {
  const validCardIds = useMemo(() => {
    const cardSet = new Set(board.cards.map((card) => card.id));
    return board.cardIds.filter((id) => cardSet.has(id));
  }, [board.cards, board.cardIds]);

  const [updatedIds, setUpdatedIds] = useState<string[]>(validCardIds);
  const [activeItem, setActiveItem] = useState<Card | null>(null);
  const [updateBoardCards] = useUpdateBoardCardsMutation();
  const { sendMessage, readyState } = useWebSocketMagneto();

  const cardMap = useMemo(() => {
    const map: Record<string, Card> = {};
    board.cards.forEach((card) => {
      map[card.id] = card;
    });
    return map;
  }, [board.cards]);

  const lockedCards = useMemo(() => {
    return board.cards
      .filter((card): card is typeof card & { locked: true } => card.locked)
      .map((card) => card.id);
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
          };

          if (readyState === WebSocket.OPEN) {
            sendMessage(
              JSON.stringify({
                type: WEBSOCKET_MESSAGE_TYPE.CARD_MOVED,
                boardId: board._id,
                cardIds: newUpdatedIds,
              }),
            );
          } else {
            await updateBoardCards(payload).unwrap();
          }
        }
      } catch {
        setUpdatedIds(validCardIds);
      } finally {
        setActiveItem(null);
      }
    },
    [board, updatedIds, updateBoardCards, cardMap, validCardIds, lockedCards],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  const safeUpdatedIds = useMemo(() => {
    return updatedIds.filter((id) => cardMap[id]);
  }, [updatedIds, cardMap]);

  const updatedIdsWithoutLocked = useMemo(() => {
    return safeUpdatedIds.filter((id) => !lockedCards.includes(id));
  }, [safeUpdatedIds, lockedCards]);

  return {
    updatedIds: safeUpdatedIds,
    updatedIdsWithoutLocked,
    activeItem,
    cardMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
