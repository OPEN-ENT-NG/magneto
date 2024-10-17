import { useState, useCallback, useMemo, useEffect } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  Active,
  Over,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";

import { CustomPointerSensor } from "./customPointer";
import { createCardMap, createSectionMap } from "./utils";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { Section } from "~/providers/BoardProvider/types";
import { useUpdateBoardMutation } from "~/services/api/boards.service";
import {
  useUpdateSectionMutation,
  useCreateSectionMutation,
} from "~/services/api/sections.service";

export const useSectionsDnD = (board: Board) => {
  const [activeItem, setActiveItem] = useState<Card | Section | null>(null);
  const [updatedSections, setUpdatedSections] = useState<Section[]>(
    board.sections,
  );
  const [originalSections, setOriginalSections] = useState<Section[]>(
    board.sections,
  );

  const [updateSection] = useUpdateSectionMutation();
  const [createSection] = useCreateSectionMutation();
  const [updateBoard] = useUpdateBoardMutation();

  const { t } = useTranslation("magneto");

  useEffect(() => {
    setUpdatedSections(board.sections);
  }, [board.sections]);

  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const sectionMap = useMemo(
    () => createSectionMap(updatedSections),
    [updatedSections],
  );
  const cardMap = useMemo(
    () => createCardMap(updatedSections),
    [updatedSections],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeType = active.data.current?.type;

      if (activeType === "card") {
        const cardInfo = cardMap[active.id.toString()];
        setActiveItem(cardInfo?.card || null);
      } else if (activeType === "section") {
        setActiveItem(sectionMap[active.id.toString()] || null);
      } else {
        setActiveItem(null);
      }

      setOriginalSections(updatedSections);
    },
    [cardMap, sectionMap, updatedSections],
  );

  const handleCardDragOver = useCallback(
    (active: Active, over: Over) => {
      const activeSection = updatedSections.find((section) =>
        section.cardIds.includes(active.id.toString()),
      );
      const overSection =
        over.data.current?.type === "section"
          ? updatedSections.find((section) => section._id === over.id)
          : updatedSections.find((section) =>
              section.cardIds.includes(over.id.toString()),
            );

      if (
        activeSection &&
        overSection &&
        activeSection._id !== overSection._id &&
        over.id !== "new-section"
      ) {
        setUpdatedSections((prev) =>
          prev.map((section) => {
            if (section._id === activeSection._id) {
              return {
                ...section,
                cardIds: section.cardIds.filter(
                  (id) => id !== active.id.toString(),
                ),
                cards: section.cards.filter(
                  (card) => card.id !== active.id.toString(),
                ),
              };
            }
            if (section._id === overSection._id) {
              const overIndex =
                over.data.current?.type === "section"
                  ? section.cardIds.length
                  : section.cardIds.indexOf(over.id.toString());
              const newCardIds = arrayMove(
                [...section.cardIds, active.id.toString()],
                section.cardIds.length,
                overIndex,
              );
              const activeCard = activeSection.cards.find(
                (card) => card.id === active.id.toString(),
              );
              const newCards = arrayMove(
                [...section.cards, activeCard!],
                section.cards.length,
                overIndex,
              );
              return { ...section, cardIds: newCardIds, cards: newCards };
            }
            return section;
          }),
        );
      }
      if (over.id === "new-section") setUpdatedSections(board.sections);
    },
    [updatedSections, board.sections],
  );

  const handleSectionDragOver = useCallback((active: Active, over: Over) => {
    setUpdatedSections((prev) => {
      const oldIndex = prev.findIndex((section) => section._id === active.id);
      const newIndex = prev.findIndex((section) => section._id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (
        activeType === "card" &&
        (overType === "card" || overType === "section")
      ) {
        handleCardDragOver(active, over);
      } else if (activeType === "section" && overType === "section") {
        handleSectionDragOver(active, over);
      }
    },
    [handleCardDragOver, handleSectionDragOver],
  );

  const handleSectionDragEnd = useCallback(async () => {
    const newOrder = updatedSections.map((section) => section._id);
    try {
      await updateBoard({
        id: board._id,
        sectionIds: newOrder,
        layoutType: board.layoutType,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update board sections:", error);
    }
  }, [updatedSections, updateBoard, board._id, board.layoutType]);
  const handleNewSectionCreation = useCallback(
    async (
      activeCardId: string,
      activeCard: Card,
      originalActiveSection: Section,
    ) => {
      const newSectionTitle = `${t("magneto.card.section")} ${
        updatedSections.length + 1
      }`;
      const newSection: Section = {
        _id: `temp-${Date.now()}`,
        title: newSectionTitle,
        cardIds: [activeCardId],
        cards: [activeCard],
        boardId: board._id,
        page: 0,
      };

      const newOriginalSectionCardIds = originalActiveSection.cardIds.filter(
        (id) => id !== activeCardId,
      );

      setUpdatedSections((prev) => [
        ...prev.map((section) =>
          section._id === originalActiveSection._id
            ? {
                ...section,
                cardIds: newOriginalSectionCardIds,
                cards: section.cards.filter((card) => card.id !== activeCardId),
              }
            : section,
        ),
        newSection,
      ]);

      try {
        await Promise.all([
          createSection({
            boardId: board._id,
            title: newSectionTitle,
            cardIds: [activeCardId],
          }).unwrap(),
          updateSection({
            id: originalActiveSection._id,
            boardId: board._id,
            cardIds: newOriginalSectionCardIds,
          }).unwrap(),
        ]);
      } catch (error) {
        console.error(
          "Failed to create new section or update original section:",
          error,
        );
        setUpdatedSections((prev) =>
          prev.filter((section) => section._id !== newSection._id),
        );
      }
    },
    [updatedSections, board._id, createSection, updateSection, t],
  );

  const handleCardMoveBetweenSections = useCallback(
    async (
      activeCardId: string,
      originalActiveSection: Section,
      currentOverSection: Section,
      over: Over,
    ) => {
      const newOriginalSectionCardIds = originalActiveSection.cardIds.filter(
        (id) => id !== activeCardId,
      );
      const newOverSectionCardIds = arrayMove(
        currentOverSection.cardIds,
        currentOverSection.cardIds.indexOf(activeCardId),
        over.id === currentOverSection._id
          ? currentOverSection.cardIds.length - 1
          : currentOverSection.cardIds.indexOf(over.id.toString()),
      );

      setUpdatedSections((prev) =>
        prev.map((section) => {
          if (section._id === originalActiveSection._id) {
            return {
              ...section,
              cardIds: newOriginalSectionCardIds,
              cards: section.cards.filter((card) => card.id !== activeCardId),
            };
          }
          if (section._id === currentOverSection._id) {
            return {
              ...section,
              cardIds: newOverSectionCardIds,
              cards: newOverSectionCardIds.map(
                (id) =>
                  section.cards.find((card) => card.id === id) ||
                  originalActiveSection.cards.find((card) => card.id === id)!,
              ),
            };
          }
          return section;
        }),
      );

      try {
        await Promise.all([
          updateSection({
            id: originalActiveSection._id,
            boardId: board._id,
            cardIds: newOriginalSectionCardIds,
          }).unwrap(),
          updateSection({
            id: currentOverSection._id,
            boardId: board._id,
            cardIds: newOverSectionCardIds,
          }).unwrap(),
        ]);
      } catch (error) {
        console.error("Failed to update sections:", error);
      }
    },
    [board._id, updateSection],
  );

  const handleCardMoveWithinSection = useCallback(
    async (activeCardId: string, currentOverSection: Section, over: Over) => {
      const newCardIds = arrayMove(
        currentOverSection.cardIds,
        currentOverSection.cardIds.indexOf(activeCardId),
        over.id === currentOverSection._id
          ? currentOverSection.cardIds.length - 1
          : currentOverSection.cardIds.indexOf(over.id.toString()),
      );
      const newCards = arrayMove(
        currentOverSection.cards,
        currentOverSection.cards.findIndex((card) => card.id === activeCardId),
        over.id === currentOverSection._id
          ? currentOverSection.cards.length - 1
          : currentOverSection.cards.findIndex(
              (card) => card.id === over.id.toString(),
            ),
      );

      setUpdatedSections((prev) =>
        prev.map((section) =>
          section._id === currentOverSection._id
            ? { ...section, cardIds: newCardIds, cards: newCards }
            : section,
        ),
      );

      try {
        await updateSection({
          id: currentOverSection._id,
          boardId: board._id,
          cardIds: newCardIds,
        }).unwrap();
      } catch (error) {
        console.error("Failed to update section:", error);
      }
    },
    [board._id, updateSection],
  );

  const handleCardDragEnd = useCallback(
    async (active: Active, over: Over) => {
      const activeCardId = active.id.toString();
      const originalActiveSection = originalSections.find((section) =>
        section.cards.some((card) => card.id === activeCardId),
      );
      const currentOverSection = updatedSections.find((section) =>
        section.cards.some((card) => card.id === activeCardId),
      );

      if (!originalActiveSection || !currentOverSection) {
        console.error("Active or over section not found");
        return;
      }

      const activeCard = originalActiveSection.cards.find(
        (card) => card.id === activeCardId,
      );
      if (!activeCard) {
        console.error("Active card not found");
        return;
      }

      if (over.id === "new-section") {
        await handleNewSectionCreation(
          activeCardId,
          activeCard,
          originalActiveSection,
        );
      } else if (originalActiveSection._id !== currentOverSection._id) {
        await handleCardMoveBetweenSections(
          activeCardId,
          originalActiveSection,
          currentOverSection,
          over,
        );
      } else {
        await handleCardMoveWithinSection(
          activeCardId,
          currentOverSection,
          over,
        );
      }
    },
    [
      originalSections,
      updatedSections,
      handleNewSectionCreation,
      handleCardMoveBetweenSections,
      handleCardMoveWithinSection,
    ],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === "section" && overType === "section") {
        await handleSectionDragEnd();
      } else if (activeType === "card") {
        await handleCardDragEnd(active, over);
      }

      setActiveItem(null);
      setOriginalSections(updatedSections);
    },
    [handleSectionDragEnd, handleCardDragEnd, updatedSections],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  const handleAddColumn = useCallback(async () => {
    const newSectionTitle = `${t("magneto.card.section")} ${
      updatedSections.length + 1
    }`;
    const tempSection: Section = {
      _id: `temp-${Date.now()}`,
      title: newSectionTitle,
      cardIds: [],
      cards: [],
      boardId: board._id,
      page: 0,
    };

    setUpdatedSections((prev) => [...prev, tempSection]);

    try {
      await createSection({
        boardId: board._id,
        title: newSectionTitle,
        cardIds: [],
      }).unwrap();
    } catch (error) {
      console.error("Failed to add new column:", error);
      setUpdatedSections((prev) =>
        prev.filter((section) => section._id !== tempSection._id),
      );
    }
  }, [board._id, createSection, t, updatedSections.length]);

  return {
    activeItem,
    updatedSections,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleAddColumn,
  };
};

export default useSectionsDnD;
