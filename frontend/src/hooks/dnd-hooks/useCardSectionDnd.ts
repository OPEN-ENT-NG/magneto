import { useState, useCallback, useMemo } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";

import { CustomPointerSensor } from "./customPointer";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import {
  useUpdateSectionMutation,
  useCreateSectionMutation,
} from "~/services/api/sections.service";

export const useCardSectionDnD = (board: Board) => {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [updateSection] = useUpdateSectionMutation();
  const [createSection] = useCreateSectionMutation();
  const { t } = useTranslation("magneto");
  
  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const cardMap = useMemo(() => {
    return board.sections.reduce(
      (acc, section) => {
        section.cards.forEach((card) => {
          acc[card.id] = { card, sectionId: section._id };
        });
        return acc;
      },
      {} as Record<string, { card: Card; sectionId: string }>,
    );
  }, [board.sections]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const cardInfo = cardMap[event.active.id.toString()];
      setActiveCard(cardInfo ? cardInfo.card : null);
    },
    [cardMap],
  );

  const createNewSection = useCallback(
    async (activeCardId: string, activeSection: any) => {
      const newSectionTitle = `${t("magneto.card.section")} ${
        board.sections.length + 1
      }`;
      try {
        await createSection({
          boardId: board._id,
          title: newSectionTitle,
          cardIds: [activeCardId],
        }).unwrap();

        const newActiveCardIds = activeSection.cardIds.filter(
          (id: string) => id !== activeCardId,
        );
        await updateSection({
          id: activeSection._id,
          boardId: board._id,
          cardIds: newActiveCardIds,
        }).unwrap();
      } catch (error) {
        console.error("Failed to update section:", error);
      }
    },
    [board._id, createSection, updateSection, t],
  );

  const reorderInSameSection = useCallback(
    async (activeSection: any, activeCardId: string, overId: string) => {
      const oldIndex = activeSection.cardIds.indexOf(activeCardId);
      const newIndex =
        overId === activeSection._id
          ? activeSection.cardIds.length
          : activeSection.cardIds.indexOf(overId);
      const newCardIds: string[] = arrayMove(
        activeSection.cardIds,
        oldIndex,
        newIndex,
      );

      try {
        await updateSection({
          id: activeSection._id,
          boardId: board._id,
          cardIds: newCardIds,
        }).unwrap();
      } catch (error) {
        console.error("Failed to update section:", error);
      }
    },
    [board._id, updateSection],
  );

  const moveBetweenSections = useCallback(
    async (
      activeSection: any,
      overSection: any,
      activeCardId: string,
      overId: string,
    ) => {
      const newActiveCardIds = activeSection.cardIds.filter(
        (id: string) => id !== activeCardId,
      );
      const newOverCardIds = [...overSection.cardIds];

      if (overId === overSection._id) {
        newOverCardIds.push(activeCardId);
      } else {
        const overIndex = overSection.cardIds.indexOf(overId);
        newOverCardIds.splice(overIndex, 0, activeCardId);
      }

      try {
        await updateSection({
          id: activeSection._id,
          boardId: board._id,
          cardIds: newActiveCardIds,
        }).unwrap();
        await updateSection({
          id: overSection._id,
          boardId: board._id,
          cardIds: newOverCardIds,
        }).unwrap();
      } catch (error) {
        console.error("Failed to update section:", error);
      }
    },
    [board._id, updateSection],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (active.id !== over?.id && over) {
        const activeCardInfo = cardMap[active.id.toString()];
        const activeSection = board.sections.find(
          (section) => section._id === activeCardInfo?.sectionId,
        );

        if (over.id === "new_section") {
          await createNewSection(active.id.toString(), activeSection);
        } else {
          const overSection = board.sections.find(
            (section) =>
              section._id === over.id ||
              section.cardIds.includes(over.id.toString()),
          );

          if (activeSection && overSection) {
            if (activeSection._id === overSection._id) {
              await reorderInSameSection(
                activeSection,
                active.id.toString(),
                over.id.toString(),
              );
            } else {
              await moveBetweenSections(
                activeSection,
                overSection,
                active.id.toString(),
                over.id.toString(),
              );
            }
          } else {
            console.error("Active or over section not found", {
              activeSection,
              overSection,
            });
          }
        }
      }

      setActiveCard(null);
    },
    [
      board,
      cardMap,
      createNewSection,
      reorderInSameSection,
      moveBetweenSections,
    ],
  );

  const handleDragCancel = useCallback(() => {
    setActiveCard(null);
  }, []);

  return {
    activeCard,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
};
