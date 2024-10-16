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
  }, [board]);

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

  const createNewSection = useCallback(
    async (activeCardId: string) => {
      const newSectionTitle = `${t("magneto.card.section")} ${
        updatedSections.length + 1
      }`;
      try {
        (await createSection({
          boardId: board._id,
          title: newSectionTitle,
          cardIds: [activeCardId],
        }).unwrap()) as Section;
      } catch (error) {
        console.error("Failed to create new section:", error);
      }
    },
    [board._id, updatedSections.length, createSection, t],
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (activeType === "section" && overType === "section") {
        // Réarrangement des sections
        const newOrder = updatedSections.map((section) => section._id);
        try {
          await updateBoard({
            id: board._id,
            sectionIds: newOrder,
            layoutType: board.layoutType,
          }).unwrap();
        } catch (error) {
          console.error("Failed to update board sections:", error);
          // Réinitialiser l'état local en cas d'échec
          setUpdatedSections(board.sections);
        }
      } else if (activeType === "card") {
        const activeSection = updatedSections.find((section) =>
          section.cardIds.includes(active.id.toString()),
        );

        if (!activeSection) {
          console.error("Active section not found");
          return;
        }

        if (over.id === "new-section") {
          // Création d'une nouvelle section avec la carte
          try {
            await createNewSection(active.id.toString());

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
            // Réarrangement dans la même section
            const newCardIds = arrayMove(
              activeSection.cardIds,
              activeSection.cardIds.indexOf(active.id.toString()),
              over.id === overSection._id
                ? activeSection.cardIds.length
                : activeSection.cardIds.indexOf(over.id.toString()),
            );

            setUpdatedSections((prev) =>
              prev.map((section) =>
                section._id === activeSection._id
                  ? { ...section, cardIds: newCardIds }
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
              setUpdatedSections((prev) => [...prev]);
            }
          } else {
            // Déplacement vers une autre section
            const newActiveCardIds = activeSection.cardIds.filter(
              (id) => id !== active.id.toString(),
            );
            const newOverCardIds = [...overSection.cardIds];

            if (over.id === overSection._id) {
              newOverCardIds.push(active.id.toString());
            } else {
              const overIndex = overSection.cardIds.indexOf(over.id.toString());
              newOverCardIds.splice(overIndex, 0, active.id.toString());
            }

            setUpdatedSections((prev) =>
              prev.map((section) => {
                if (section._id === activeSection._id) {
                  return { ...section, cardIds: newActiveCardIds };
                }
                if (section._id === overSection._id) {
                  return { ...section, cardIds: newOverCardIds };
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
              setUpdatedSections((prev) => [...prev]);
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
      createNewSection,
      setUpdatedSections,
    ],
  );

  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
  }, []);

  const handleAddColumn = useCallback(async () => {
    const newSectionTitle = `${t("magneto.card.section")} ${
      updatedSections.length + 1
    }`;
    try {
      const newSection = (await createSection({
        boardId: board._id,
        title: newSectionTitle,
        cardIds: [],
      }).unwrap()) as Section;

      setUpdatedSections((prev) => [...prev, newSection]);
    } catch (error) {
      console.error("Failed to add new column:", error);
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
