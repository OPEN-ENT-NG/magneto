import { WebSocketUpdate } from "~/providers/WebsocketProvider/types";

const cacheUpdateCallbacks = new Set<(update: WebSocketUpdate) => void>();

export const registerCacheUpdateCallback = (
  callback: (update: WebSocketUpdate) => void,
) => {
  cacheUpdateCallbacks.add(callback);
  return () => cacheUpdateCallbacks.delete(callback);
};

export const notifyCacheUpdateCallbacks = (update: WebSocketUpdate) => {
  cacheUpdateCallbacks.forEach((callback) => {
    callback(update);
  });
};

export const applyBoardUpdate = (draft: any, update: WebSocketUpdate) => {
  switch (update.type) {
    case "cardAdded": {
      const newCard = update.card;
      if (draft.sections && newCard.sectionId) {
        const section = draft.sections.find(
          (s: any) => s._id === newCard.sectionId,
        );
        if (section && section.cards) {
          section.cards.unshift(newCard);
        }
      } else if (draft.cards) {
        draft.cards.unshift(newCard);
        if (draft.cardIds) {
          draft.cardIds.unshift(newCard.id);
        }
      }
      break;
    }

    case "cardFavorite":
    case "commentAdded":
    case "commentEdited":
    case "commentDeleted":
    case "cardUpdated": {
      if (draft.cards) {
        const cardIndex = draft.cards.findIndex(
          (c: any) => c.id === update.card.id,
        );
        if (cardIndex !== -1) {
          const filteredUpdate = Object.fromEntries(
            Object.entries(update.card).filter(([, value]) => value !== null),
          );
          Object.assign(draft.cards[cardIndex], filteredUpdate);
        }
      }
      if (draft.sections) {
        draft.sections.forEach((section: any) => {
          if (section.cards) {
            const cardIndex = section.cards.findIndex(
              (c: any) => c.id === update.card.id,
            );
            if (cardIndex !== -1) {
              const filteredUpdate = Object.fromEntries(
                Object.entries(update.card).filter(
                  ([, value]) => value !== null,
                ),
              );
              Object.assign(section.cards[cardIndex], filteredUpdate);
            }
          }
        });
      }
      break;
    }

    case "cardDeleted": {
      const cardIdToDelete = update.cardId || update.card?.id;
      if (draft.cards) {
        draft.cards = draft.cards.filter((c: any) => c.id !== cardIdToDelete);
        if (draft.cardIds) {
          draft.cardIds = draft.cardIds.filter(
            (id: any) => id !== cardIdToDelete,
          );
        }
      }
      if (draft.sections) {
        draft.sections.forEach((section: any) => {
          if (section.cards) {
            section.cards = section.cards.filter(
              (c: any) => c.id !== cardIdToDelete,
            );
          }
        });
      }
      break;
    }

    case "sectionUpdated": {
      if (draft.sections) {
        const sectionIndex = draft.sections.findIndex(
          (s: any) => s._id === update.section.id,
        );
        if (sectionIndex !== -1) {
          const filteredUpdate = Object.fromEntries(
            Object.entries(update.section).filter(
              ([, value]) => value !== null,
            ),
          );
          Object.assign(draft.sections[sectionIndex], filteredUpdate);
        }
      }
      break;
    }
  }
};
