import { useState, useCallback, useMemo, useEffect } from "react";

import {
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  Active,
} from "@dnd-kit/core";
import { DroppableContainer, RectMap } from "@dnd-kit/core/dist/store";
import { arrayMove } from "@dnd-kit/sortable";
import { Coordinates } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";

import { CustomPointerSensor } from "./customPointer";
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
  const [updateSection] = useUpdateSectionMutation();
  const [createSection] = useCreateSectionMutation();
  const [updateBoard] = useUpdateBoardMutation();
  const [originalSections, setOriginalSections] = useState<Section[]>(
    board.sections,
  );
  const { t } = useTranslation("magneto");

  useEffect(() => {
    setUpdatedSections(board.sections);
  }, [board.sections]);

  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const sectionMap = useMemo(() => {
    return updatedSections.reduce(
      (acc, section) => {
        acc[section._id] = section;
        return acc;
      },
      {} as Record<string, Section>,
    );
  }, [updatedSections]);

  const cardMap = useMemo(() => {
    return updatedSections.reduce(
      (acc, section) => {
        section.cards.forEach((card) => {
          acc[card.id] = { card, sectionId: section._id };
        });
        return acc;
      },
      {} as Record<string, { card: Card; sectionId: string }>,
    );
  }, [updatedSections]);

  const collisionDetectionStrategy = useCallback(
    (args: {
      active: Active;
      collisionRect: ClientRect;
      droppableRects: RectMap;
      droppableContainers: DroppableContainer[];
      pointerCoordinates: Coordinates | null;
    }) => {
      const pointerCollisions = pointerWithin(args);
      const intersections = rectIntersection(args);
      const allCollisions = [...pointerCollisions, ...intersections];

      const activeType = args.active.data.current?.type;
      if (activeType === "section") {
        return allCollisions.filter(
          (collision) => collision.data?.current?.type === "section",
        );
      } else if (activeType === "card") {
        return allCollisions;
      }

      return [];
    },
    [],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeType = active.data.current?.type;

      if (activeType === "card") {
        const cardInfo = cardMap[active.id.toString()];
        if (cardInfo) {
          setActiveItem(cardInfo.card);
        }
      } else if (activeType === "section") {
        setActiveItem(sectionMap[active.id.toString()]);
      } else {
        setActiveItem(null);
      }

      setOriginalSections(updatedSections);
    },
    [cardMap, sectionMap, updatedSections],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      console.log(over?.id ?? null);

      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (
        activeType === "card" &&
        (overType === "card" || overType === "section")
      ) {
        const activeSection = updatedSections.find((section) =>
          section.cardIds.includes(active.id.toString()),
        );
        const overSection =
          overType === "section"
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
          setUpdatedSections((prev) => {
            return prev.map((section) => {
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
                  overType === "section"
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
            });
          });
        }
        if (over.id === "new-section") setUpdatedSections(board.sections);
      } else if (activeType === "section" && overType === "section") {
        setUpdatedSections((prev) => {
          const oldIndex = prev.findIndex(
            (section) => section._id === active.id,
          );
          const newIndex = prev.findIndex((section) => section._id === over.id);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    [updatedSections],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === "section" && overType === "section") {
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
      } else if (activeType === "card") {
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

          const newOriginalSectionCardIds =
            originalActiveSection.cardIds.filter((id) => id !== activeCardId);

          setUpdatedSections((prev) => [
            ...prev.map((section) =>
              section._id === originalActiveSection._id
                ? {
                    ...section,
                    cardIds: newOriginalSectionCardIds,
                    cards: section.cards.filter(
                      (card) => card.id !== activeCardId,
                    ),
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
        } else if (originalActiveSection._id !== currentOverSection._id) {
          const newOriginalSectionCardIds =
            originalActiveSection.cardIds.filter((id) => id !== activeCardId);
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
                  cards: section.cards.filter(
                    (card) => card.id !== activeCardId,
                  ),
                };
              }
              if (section._id === currentOverSection._id) {
                return {
                  ...section,
                  cardIds: newOverSectionCardIds,
                  cards: newOverSectionCardIds.map(
                    (id) =>
                      section.cards.find((card) => card.id === id) ||
                      activeCard,
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
        } else {
          const newCardIds = arrayMove(
            currentOverSection.cardIds,
            currentOverSection.cardIds.indexOf(activeCardId),
            over.id === currentOverSection._id
              ? currentOverSection.cardIds.length - 1
              : currentOverSection.cardIds.indexOf(over.id.toString()),
          );
          const newCards = arrayMove(
            currentOverSection.cards,
            currentOverSection.cards.findIndex(
              (card) => card.id === activeCardId,
            ),
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
        }
      }

      setActiveItem(null);
      setOriginalSections(updatedSections);
    },
    [
      board,
      updatedSections,
      originalSections,
      updateSection,
      updateBoard,
      createSection,
      t,
    ],
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
  }, [board._id, updatedSections.length, createSection, t]);

  return {
    activeItem,
    updatedSections,
    sensors,
    collisionDetectionStrategy,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleAddColumn,
  };
};
