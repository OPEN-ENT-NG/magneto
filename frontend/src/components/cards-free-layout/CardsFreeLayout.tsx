import { FC, memo, useMemo, useCallback, useState } from "react";
import { closestCenter, DndContext, DragOverlay } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Box, Button } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import BoardCard from "../board-card/BoardCard";
import { CardDisplayProps } from "../cards-vertical-layout/types";
import { useFreeLayoutCardDnD } from "~/hooks/dnd-hooks/useFreeLayoutCardDnD";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

const MemoizedBoardCard = memo(BoardCard);

const MemoizedCardItem = memo(
  ({
    cardId,
    card,
    displayProps,
    index,
    totalCards,
    hasEditRights,
  }: {
    cardId: string;
    card: Card;
    displayProps: CardDisplayProps;
    index: number;
    totalCards: number;
    hasEditRights: boolean;
  }) => (
    <LiWrapper
      key={cardId}
      isLast={index === totalCards - 1}
      zoomLevel={displayProps.zoomLevel}
    >
      <MemoizedBoardCard
        card={card}
        zoomLevel={displayProps.zoomLevel}
        canComment={displayProps.canComment}
        displayNbFavorites={displayProps.displayNbFavorites}
        readOnly={hasEditRights}
      />
    </LiWrapper>
  ),
  (prevProps, nextProps) => {
    return (
      prevProps.cardId === nextProps.cardId &&
      prevProps.index === nextProps.index &&
      prevProps.totalCards === nextProps.totalCards &&
      prevProps.displayProps.zoomLevel === nextProps.displayProps.zoomLevel &&
      prevProps.displayProps.canComment === nextProps.displayProps.canComment &&
      prevProps.card.lastComment === nextProps.card.lastComment &&
      prevProps.card.nbOfComments === nextProps.card.nbOfComments &&
      prevProps.displayProps.displayNbFavorites ===
        nextProps.displayProps.displayNbFavorites
    );
  },
);

const MemoizedDragOverlay = memo(
  ({
    activeItem,
    displayProps,
  }: {
    activeItem: Card | null;
    displayProps: CardDisplayProps;
  }) => {
    const { hasEditRights } = useBoard();
    if (!activeItem) return null;

    return (
      <MemoizedBoardCard
        card={activeItem}
        zoomLevel={displayProps.zoomLevel}
        canComment={displayProps.canComment}
        displayNbFavorites={displayProps.displayNbFavorites}
        readOnly={hasEditRights()}
      />
    );
  },
);

export const CardsFreeLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();
  const {
    updatedIds,
    updatedIdsWithoutLocked,
    activeItem,
    cardMap,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useFreeLayoutCardDnD(board);

  const [localCards, setLocalCards] = useState(updatedIds);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeItemColor, setActiveItemColor] = useState<string>('blue');
  const displayProps = useMemo(
    () => ({
      zoomLevel,
      canComment: board.canComment,
      displayNbFavorites: board.displayNbFavorites,
    }),
    [zoomLevel, board.canComment, board.displayNbFavorites],
  );

  const memoizedHandleDragStart = useCallback(handleDragStart, [
    handleDragStart,
  ]);
  const memoizedHandleDragEnd = useCallback(handleDragEnd, [handleDragEnd]);
  const memoizedHandleDragCancel = useCallback(handleDragCancel, [
    handleDragCancel,
  ]);

  // Simuler un changement d'ordre des cartes pour tester les animations
// Simulation de déplacement des cartes
const simulateCardMovements = () => {
  const cards = [...localCards];
  const initialActiveItemId = cards[Math.floor(Math.random() * cards.length)];
  
  const moveCard = (
    currentCards: string[], 
    activeItemId: string, 
    moveCount: number, 
    currentColor: string
  ) => {
    // Trouver l'index de la carte active
    const currentActiveIndex = currentCards.findIndex(id => id === activeItemId);
    
    // Générer un nouvel index différent de l'index actuel
    const newIndex = currentCards.reduce((acc, _, index) => {
      return index !== currentActiveIndex && Math.random() > 0.5 ? index : acc;
    }, currentActiveIndex);

    // Créer une nouvelle liste de cartes avec la carte active déplacée
    const updatedCards = [...currentCards];
    const [movedCard] = updatedCards.splice(currentActiveIndex, 1);
    updatedCards.splice(newIndex, 0, movedCard);

    // Déterminer le nouvel activeItemId et la nouvelle couleur
    const nextMoveCount = moveCount + 1;
    const isTimeToChangeActive = nextMoveCount % 5 === 0;
    const nextActiveItemId = isTimeToChangeActive
      ? updatedCards[Math.floor(Math.random() * updatedCards.length)]
      : activeItemId;
    const nextColor = isTimeToChangeActive
      ? (currentColor === 'blue' ? 'green' : 'blue')
      : currentColor;

    // Mettre à jour l'état
    setLocalCards(updatedCards);
    setActiveItemId(nextActiveItemId);
    console.log("venant du flux",{activeItem:activeItemId,array:updatedCards});
    
    if (isTimeToChangeActive) {
      setActiveItemColor(nextColor);
    }

    // Continuer les mouvements
    if (nextMoveCount < 15) { // Limiter à 15 mouvements
      setTimeout(() => {
        moveCard(updatedCards, nextActiveItemId, nextMoveCount, nextColor);
      }, 500);
    }
  };

  // Commencer les mouvements
  setActiveItemId(initialActiveItemId);
  moveCard(cards, initialActiveItemId, 0, 'blue');
};

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={memoizedHandleDragStart}
      onDragEnd={memoizedHandleDragEnd}
      onDragCancel={memoizedHandleDragCancel}
    >
      <SortableContext
        items={updatedIdsWithoutLocked}
        strategy={rectSortingStrategy}
      >
        <Box sx={mainWrapperProps}>
          <Button onClick={simulateCardMovements}>
            Simuler le déplacement des cartes
          </Button>
          <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
            <AnimatePresence>
              {localCards.map((cardId, index) => (
                <motion.li
                  key={cardId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    border: activeItemId === cardId ? `2px solid ${activeItemColor}` : "none",
                    opacity: activeItemId === cardId ? 0.7 : 1,
                  }}
                >
                  <MemoizedCardItem
                    cardId={cardId}
                    card={cardMap[cardId]}
                    displayProps={displayProps}
                    index={index}
                    totalCards={localCards.length}
                    hasEditRights={!hasEditRights()}
                  />
                  {activeItemId === cardId && (
                    <div style={{ position: "absolute", top: -20 }}>
                      User dragging
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </UlWrapper>
        </Box>
      </SortableContext>
      <DragOverlay adjustScale style={{ transformOrigin: "0 0 " }}>
        <MemoizedDragOverlay
          activeItem={activeItem}
          displayProps={displayProps}
        />
      </DragOverlay>
    </DndContext>
  );
};
