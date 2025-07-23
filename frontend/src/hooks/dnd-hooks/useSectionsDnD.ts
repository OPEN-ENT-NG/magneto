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
import { useToast } from "@edifice.io/react";
import { useTranslation } from "react-i18next";

import { CustomPointerSensor } from "./customPointer";
import {
  reorderOriginalSectionWithLockedItems,
  reorderOriginalSectionWithLockedItemsArray,
  reorderOverSectionWithLockedItems,
  reorderOverSectionWithLockedItemsArray,
  reorderWithLockedItems,
  reorderWithLockedItemsArray,
} from "./reorderUtils";
import { ActiveItemState, DND_ITEM_TYPE } from "./types";
import { createCardMap, createSectionMap } from "./utils";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import { useUpdateBoardCardsMutation } from "~/services/api/boards.service";
import {
  useUpdateSectionMutation,
  useCreateSectionMutation,
} from "~/services/api/sections.service";

export const useSectionsDnD = (board: Board) => {
  const [activeItem, setActiveItem] = useState<ActiveItemState>(null);
  const [updatedSections, setUpdatedSections] = useState<Section[]>(
    board.sections,
  );
  const [originalSections, setOriginalSections] = useState<Section[]>(
    board.sections,
  );
  const [newMagnetOver, setNewMagnetOver] = useState<Card[]>([]);
  const [updateSection] = useUpdateSectionMutation();
  const [createSection] = useCreateSectionMutation();
  const [updateBoardCards] = useUpdateBoardCardsMutation();
  const { sendMessage, readyState } = useWebSocketMagneto();
  const { isFetching } = useBoard();
  const { t } = useTranslation("magneto");
  const toast = useToast();

  const lockedCardIds = useMemo(() => {
    console.log("🚀 ~ lockedCardIds ~ updatedSections:", updatedSections);
    return updatedSections.flatMap((section) =>
      section.cards.filter((card) => card.locked).map((card) => card.id),
    );
  }, [updatedSections]);

  useEffect(() => {
    setUpdatedSections(board.sections);
  }, [board.sections]);

  const sensors = useSensors(
    useSensor(CustomPointerSensor, {
      activationConstraint: { distance: 1 },
      isFetching,
    }),
  );

  const sectionMap = useMemo(
    () => createSectionMap(updatedSections),
    [updatedSections, newMagnetOver],
  );

  const cardMap = useMemo(
    () => createCardMap(updatedSections),
    [updatedSections, newMagnetOver],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeType = active.data.current?.type;

      if (activeType === DND_ITEM_TYPE.CARD) {
        const cardInfo = cardMap[active.id.toString()];
        setActiveItem(cardInfo?.card ?? null);
      } else if (activeType === DND_ITEM_TYPE.SECTION) {
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
        over.data.current?.type === DND_ITEM_TYPE.SECTION
          ? updatedSections.find((section) => section._id === over.id)
          : updatedSections.find((section) =>
              section.cardIds.includes(over.id.toString()),
            );

      // Si on survole new-section
      if (over.id === "new-section") {
        // Ne stocke la carte dans newMagnetOver que si elle n'y est pas déjà
        if (newMagnetOver.length === 0 && activeItem instanceof Card) {
          setNewMagnetOver([activeItem]);

          // Retire la carte de sa section d'origine
          setUpdatedSections((prev) =>
            prev.map((section) => {
              if (section._id === activeSection?._id) {
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
              return section;
            }),
          );
        }
        return;
      }

      // Si on quitte new-section pour une autre section
      if (newMagnetOver.length > 0 && activeSection === undefined) {
        const draggedCard = newMagnetOver[0];
        // Vide newMagnetOver

        if (overSection) {
          // Ajoute la carte à la section survolée
          setNewMagnetOver([]);
          setUpdatedSections((prev) =>
            prev.map((section) => {
              if (section._id === overSection._id) {
                const overIndex =
                  over.data.current?.type === DND_ITEM_TYPE.SECTION
                    ? section.cardIds.length
                    : section.cardIds.indexOf(over.id.toString());

                const newCardIds = arrayMove(
                  [...section.cardIds, draggedCard.id],
                  section.cardIds.length,
                  overIndex,
                );

                const newCards = arrayMove(
                  [...section.cards, draggedCard],
                  section.cards.length,
                  overIndex,
                );

                return { ...section, cardIds: newCardIds, cards: newCards };
              }
              return section;
            }),
          );
        }
        return;
      }

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
                over.data.current?.type === DND_ITEM_TYPE.SECTION
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
    },
    [updatedSections, newMagnetOver, activeItem],
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
        activeType === DND_ITEM_TYPE.CARD &&
        (overType === DND_ITEM_TYPE.CARD || overType === DND_ITEM_TYPE.SECTION)
      ) {
        handleCardDragOver(active, over);
      } else if (
        activeType === DND_ITEM_TYPE.SECTION &&
        overType === DND_ITEM_TYPE.SECTION
      ) {
        handleSectionDragOver(active, over);
      }
    },
    [handleCardDragOver, handleSectionDragOver],
  );

  const handleSectionDragEnd = useCallback(async () => {
    const newOrder = updatedSections.map((section) => section._id);
    try {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: "cardMoved",
            boardId: board._id,
            sectionIds: newOrder,
          }),
        );
      } else {
        await updateBoardCards({
          id: board._id,
          sectionIds: newOrder,
        }).unwrap();
      }
    } catch (error) {
      console.error("Failed to update board sections:", error);
    }
  }, [updatedSections, updateBoardCards, board._id, board.layoutType]);
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

      const lockedCardsOriginal = originalActiveSection.cards
        .filter((card): card is typeof card & { locked: true } => card.locked)
        .map((card) => card.id);

      const newOriginalSectionCardIds = reorderOriginalSectionWithLockedItems(
        originalActiveSection.cardIds,
        originalActiveSection.cardIds.indexOf(activeCardId),
        lockedCardsOriginal,
        activeCardId,
      );

      const newOriginalSectionCards =
        reorderOriginalSectionWithLockedItemsArray(
          originalActiveSection.cards,
          originalActiveSection.cards.findIndex(
            (card) => card.id === activeCardId,
          ),
          lockedCardsOriginal,
          activeCardId,
        );

      setUpdatedSections((prev) => [
        ...prev.map((section) =>
          section._id === originalActiveSection._id
            ? {
                ...section,
                cardIds: newOriginalSectionCardIds,
                cards: newOriginalSectionCards,
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
      const lockedCardsOriginal = originalActiveSection.cards
        .filter((card): card is typeof card & { locked: true } => card.locked)
        .map((card) => card.id);

      const lockedCardsOver = currentOverSection.cards
        .filter((card): card is typeof card & { locked: true } => card.locked)
        .map((card) => card.id);

      const newOriginalSectionCardIds = reorderOriginalSectionWithLockedItems(
        originalActiveSection.cardIds,
        originalActiveSection.cardIds.indexOf(activeCardId),
        lockedCardsOriginal,
        activeCardId,
      );

      if (
        newOriginalSectionCardIds === originalActiveSection.cardIds ||
        lockedCardsOver.includes(activeCardId)
      ) {
        toast.error(t("magneto.dnd.locked.error"));
        const currentOverSectionWithoutNewCard = {
          ...currentOverSection,
          cardIds: currentOverSection.cardIds.filter(
            (item) => item !== activeCardId,
          ),
          cards: currentOverSection.cards.filter(
            (item) => item.id !== activeCardId,
          ),
        };
        setUpdatedSections((prev) =>
          prev.map((section) => {
            if (section._id === originalActiveSection._id) {
              return {
                ...section,
                cardIds: originalActiveSection.cardIds,
                cards: originalActiveSection.cards,
              };
            }
            if (section._id === currentOverSection._id) {
              return {
                ...section,
                cardIds: currentOverSectionWithoutNewCard.cardIds,
                cards: currentOverSectionWithoutNewCard.cards,
              };
            }
            return section;
          }),
        );
        try {
          if (readyState === WebSocket.OPEN) {
            sendMessage(
              JSON.stringify({
                type: "sectionUpdated",
                section: {
                  id: originalActiveSection._id,
                  boardId: board._id,
                  cardIds: originalActiveSection.cardIds,
                },
              }),
            );
            sendMessage(
              JSON.stringify({
                type: "sectionUpdated",
                section: {
                  id: currentOverSectionWithoutNewCard._id,
                  boardId: board._id,
                  cardIds: currentOverSectionWithoutNewCard.cardIds,
                },
              }),
            );
          } else {
            await Promise.all([
              updateSection({
                id: originalActiveSection._id,
                boardId: board._id,
                cardIds: originalActiveSection.cardIds,
              }).unwrap(),
              updateSection({
                id: currentOverSectionWithoutNewCard._id,
                boardId: board._id,
                cardIds: currentOverSectionWithoutNewCard.cardIds,
              }).unwrap(),
            ]);
          }
        } catch (error) {
          console.error("Failed to update sections:", error);
        }
      } else {
        const newOriginalSectionCards =
          reorderOriginalSectionWithLockedItemsArray(
            originalActiveSection.cards,
            originalActiveSection.cards.findIndex(
              (card) => card.id === activeCardId,
            ),
            lockedCardsOriginal,
            activeCardId,
          );

        const newOverSectionCardIds = reorderOverSectionWithLockedItems(
          currentOverSection.cardIds,
          currentOverSection.cardIds.indexOf(activeCardId),
          over.id === currentOverSection._id
            ? currentOverSection.cardIds.length - 1
            : currentOverSection.cardIds.indexOf(over.id.toString()),
          lockedCardsOver,
        );

        const newOverSectionCards = reorderOverSectionWithLockedItemsArray(
          currentOverSection.cards,
          currentOverSection.cards.findIndex(
            (card) => card.id === activeCardId,
          ),
          over.id === currentOverSection._id
            ? currentOverSection.cards.length - 1
            : currentOverSection.cards.findIndex(
                (card) => card.id === over.id.toString(),
              ),
          lockedCardsOver,
        );

        setUpdatedSections((prev) =>
          prev.map((section) => {
            if (section._id === originalActiveSection._id) {
              return {
                ...section,
                cardIds: newOriginalSectionCardIds,
                cards: newOriginalSectionCards,
              };
            }
            if (section._id === currentOverSection._id) {
              return {
                ...section,
                cardIds: newOverSectionCardIds,
                cards: newOverSectionCards,
              };
            }
            return section;
          }),
        );
        try {
          if (readyState === WebSocket.OPEN) {
            sendMessage(
              JSON.stringify({
                type: "sectionUpdated",
                section: {
                  id: originalActiveSection._id,
                  boardId: board._id,
                  cardIds: newOriginalSectionCardIds,
                },
              }),
            );
            sendMessage(
              JSON.stringify({
                type: "sectionUpdated",
                section: {
                  id: currentOverSection._id,
                  boardId: board._id,
                  cardIds: newOverSectionCardIds,
                },
              }),
            );
          } else {
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
          }
        } catch (error) {
          console.error("Failed to update sections:", error);
        }
      }
    },
    [board._id, updateSection],
  );

  const handleCardMoveWithinSection = useCallback(
    async (activeCardId: string, currentOverSection: Section, over: Over) => {
      const lockedCards = currentOverSection.cards
        .filter((card): card is typeof card & { locked: true } => card.locked)
        .map((card) => card.id);

      const newCardIds = reorderWithLockedItems(
        currentOverSection.cardIds,
        currentOverSection.cardIds.indexOf(activeCardId),
        over.id === currentOverSection._id
          ? currentOverSection.cardIds.length - 1
          : currentOverSection.cardIds.indexOf(over.id.toString()),
        lockedCards,
      );

      if (newCardIds === currentOverSection.cardIds) {
        toast.error(t("magneto.dnd.locked.error"));
      }

      const newCards = reorderWithLockedItemsArray(
        currentOverSection.cards,
        currentOverSection.cards.findIndex((card) => card.id === activeCardId),
        over.id === currentOverSection._id
          ? currentOverSection.cards.length - 1
          : currentOverSection.cards.findIndex(
              (card) => card.id === over.id.toString(),
            ),
        lockedCards,
      );

      setUpdatedSections((prev) =>
        prev.map((section) =>
          section._id === currentOverSection._id
            ? { ...section, cardIds: newCardIds, cards: newCards }
            : section,
        ),
      );

      try {
        if (readyState === WebSocket.OPEN) {
          sendMessage(
            JSON.stringify({
              type: "sectionUpdated",
              section: {
                id: currentOverSection._id,
                boardId: board._id,
                cardIds: newCardIds,
              },
            }),
          );
        } else {
          await updateSection({
            id: currentOverSection._id,
            boardId: board._id,
            cardIds: newCardIds,
          }).unwrap();
        }
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

      if (!originalActiveSection) {
        console.error("Active section not found");
        return;
      }

      const activeCard = originalActiveSection.cards.find(
        (card) => card.id === activeCardId,
      );
      if (!activeCard) {
        console.error("Active card not found");
        return;
      }

      if (over.id === "new-section" || over.id === newMagnetOver[0]?.id) {
        setNewMagnetOver([]);
        return await handleNewSectionCreation(
          activeCardId,
          activeCard,
          originalActiveSection,
        );
      }
      if (!currentOverSection) {
        console.error("Over section not found");
        return;
      }
      if (originalActiveSection._id !== currentOverSection._id) {
        return await handleCardMoveBetweenSections(
          activeCardId,
          originalActiveSection,
          currentOverSection,
          over,
        );
      }

      return await handleCardMoveWithinSection(
        activeCardId,
        currentOverSection,
        over,
      );
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

      if (
        activeType === DND_ITEM_TYPE.SECTION &&
        overType === DND_ITEM_TYPE.SECTION
      ) {
        await handleSectionDragEnd();
      } else if (activeType === DND_ITEM_TYPE.CARD) {
        await handleCardDragEnd(active, over);
      }
      setNewMagnetOver([]);
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
    newMagnetOver,
    activeItem,
    updatedSections,
    lockedCardIds,
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleAddColumn,
  };
};

export default useSectionsDnD;
