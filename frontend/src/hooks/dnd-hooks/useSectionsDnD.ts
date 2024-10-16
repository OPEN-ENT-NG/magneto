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

      if (activeType === "section") {
        setActiveItem(sectionMap[active.id]);
      } else {
        const cardInfo = cardMap[active.id];
        setActiveItem(cardInfo ? cardInfo.card : null);
      }
    },
    [sectionMap, cardMap],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "section" && overType === "section") {
      setUpdatedSections((prev) => {
        const oldIndex = prev.findIndex((section) => section._id === active.id);
        const newIndex = prev.findIndex((section) => section._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === "section" && overType === "section") {
        const newOrder = updatedSections.map((section) => section._id);
        setUpdatedSections((prev) =>
          arrayMove(
            prev,
            prev.findIndex((s) => s._id === active.id),
            prev.findIndex((s) => s._id === over.id),
          ),
        );
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
        const activeSection = updatedSections.find((section) =>
          section.cardIds.includes(active.id.toString()),
        );

        if (!activeSection) {
          console.error("Active section not found");
          return;
        }
        const activeCard = activeSection.cards.find(
          (card) => card.id === active.id.toString(),
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
            cardIds: [active.id.toString()],
            cards: [cardMap[active.id.toString()].card],
            boardId: board._id,
            page: 0,
          };

          setUpdatedSections((prev) => [
            ...prev.map((section) =>
              section._id === activeSection._id
                ? {
                    ...section,
                    cardIds: section.cardIds.filter(
                      (id) => id !== active.id.toString(),
                    ),
                    cards: section.cards.filter(
                      (card) => card.id !== active.id.toString(),
                    ),
                  }
                : section,
            ),
            newSection,
          ]);

          try {
            await createSection({
              boardId: board._id,
              title: newSectionTitle,
              cardIds: [active.id.toString()],
            }).unwrap();

            await updateSection({
              id: activeSection._id,
              boardId: board._id,
              cardIds: activeSection.cardIds.filter(
                (id) => id !== active.id.toString(),
              ),
            }).unwrap();
          } catch (error) {
            console.error(
              "Failed to create new section or update original section:",
              error,
            );
            setUpdatedSections((prev) =>
              prev.filter((section) => section._id !== newSection._id),
            );
          }
        } else {
          const overSection =
            overType === "section"
              ? updatedSections.find((section) => section._id === over.id)
              : updatedSections.find((section) =>
                  section.cardIds.includes(over.id.toString()),
                );

          if (!overSection) {
            console.error("Over section not found");
            return;
          }

          if (activeSection._id === overSection._id) {
            const newCardIds = arrayMove(
              activeSection.cardIds,
              activeSection.cardIds.indexOf(active.id.toString()),
              over.id === overSection._id
                ? activeSection.cardIds.length
                : activeSection.cardIds.indexOf(over.id.toString()),
            );
            const newCards = arrayMove(
              activeSection.cards,
              activeSection.cards.findIndex(
                (card) => card.id === active.id.toString(),
              ),
              over.id === overSection._id
                ? activeSection.cards.length
                : activeSection.cards.findIndex(
                    (card) => card.id === over.id.toString(),
                  ),
            );

            setUpdatedSections((prev) =>
              prev.map((section) =>
                section._id === activeSection._id
                  ? { ...section, cardIds: newCardIds, cards: newCards }
                  : section,
              ),
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
          } else {
            const newActiveCardIds = activeSection.cardIds.filter(
              (id) => id !== active.id.toString(),
            );
            const newActiveCards = activeSection.cards.filter(
              (card) => card.id !== active.id.toString(),
            );
            const newOverCardIds = [...overSection.cardIds];
            const newOverCards = [...overSection.cards];

            if (over.id === overSection._id) {
              newOverCardIds.push(active.id.toString());
              newOverCards.push(activeCard);
            } else {
              const overIndex = overSection.cardIds.indexOf(over.id.toString());
              newOverCardIds.splice(overIndex, 0, active.id.toString());
              newOverCards.splice(overIndex, 0, activeCard);
            }

            setUpdatedSections((prev) =>
              prev.map((section) => {
                if (section._id === activeSection._id) {
                  return {
                    ...section,
                    cardIds: newActiveCardIds,
                    cards: newActiveCards,
                  };
                }
                if (section._id === overSection._id) {
                  return {
                    ...section,
                    cardIds: newOverCardIds,
                    cards: newOverCards,
                  };
                }
                return section;
              }),
            );

            try {
              await Promise.all([
                updateSection({
                  id: activeSection._id,
                  boardId: board._id,
                  cardIds: newActiveCardIds,
                }).unwrap(),
                updateSection({
                  id: overSection._id,
                  boardId: board._id,
                  cardIds: newOverCardIds,
                }).unwrap(),
              ]);
            } catch (error) {
              console.error("Failed to update sections:", error);
            }
          }
        }
      }

      setActiveItem(null);
    },
    [
      board,
      updatedSections,
      updateSection,
      updateBoard,
      createSection,
      cardMap,
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
