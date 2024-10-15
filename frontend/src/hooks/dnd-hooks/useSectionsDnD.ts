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
import { useUpdateBoardMutation } from "~/services/api/boards.service";
import { Section } from "~/providers/BoardProvider/types";

export const useSectionsDnD = (board: Board) => {
  const [updatedIds, setUpdatedIds] = useState<string[]>(board.sectionsIds);
  const [activeItem, setActiveItem] = useState<Section | null>(null);
  const [updateBoard] = useUpdateBoardMutation();

  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    setUpdatedIds(board.sectionsIds);
  }, [board]);

  const sectionMap = useMemo(() => {
    console.log("section map");

    return board.sections.reduce(
      (acc, section) => {
        acc[section._id] = section;
        return acc;
      },
      {} as Record<string, Section>,
    );
  }, [board.sections]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      console.log("handleDragStart");

      setActiveItem(sectionMap[event.active.id.toString()] ?? null);
    },
    [sectionMap],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      
      const { active, over } = event;
      console.log({ active, over});


      if (active.id !== over?.id) {
        const realSectionId = updatedIds.find((sectionId: string) => sectionId === over?.id) 
        ?? board.sections.reduce((acc: string, section: Section) => {
          const matchingCardId = section.cardIds.find(
            (cardId: string) => cardId === over?.id,
          );

          return matchingCardId ? section._id : acc;
      }, "");        console.log(realSectionId);
      
        const oldIndex = updatedIds.indexOf(active.id.toString());
        const newIndex = updatedIds.indexOf(realSectionId?.toString() ?? updatedIds[updatedIds.length - 1],
        );

        
        console.log("active != over", "old", oldIndex, "new", newIndex);
        const newUpdatedIds = arrayMove(updatedIds, oldIndex, newIndex);
        console.log({updatedIds, newUpdatedIds});
        setUpdatedIds(newUpdatedIds);

        const payload = {
          id: board._id,
          sectionsIds: newUpdatedIds,
          layoutType: board.layoutType,
          canComment: board.canComment,
          displayNbFavorites: board.displayNbFavorites,
        };

        try {
          console.log("payload", payload);
          // await updateBoard(payload).unwrap();
        } catch (error) {
          console.error("Failed to update board:", error);
          setUpdatedIds(board.sectionsIds);
        }
      }

      setActiveItem(null);
    },
    [board, updatedIds, updateBoard],
  );

  const handleDragCancel = useCallback(() => {
    console.log("handleDragCancel");

    setActiveItem(null);
  }, []);
 

  return {
    updatedIds,
    activeItem,
    sectionMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
