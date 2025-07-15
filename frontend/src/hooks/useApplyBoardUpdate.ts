import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
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
    case WEBSOCKET_MESSAGE_TYPE.CARD_ADDED: {
      const newCard = update.card;
      if (newCard && draft.sections && draft.sections.length > 0) {
        const firstSection = draft.sections[0];
        if (firstSection.cards) {
          firstSection.cards.unshift(newCard);
        }
      } else if (newCard && draft.cards) {
        draft.cards.unshift(newCard);
        if (draft.cardIds) {
          draft.cardIds.unshift(newCard.id);
        }
      }
      break;
    }

    case WEBSOCKET_MESSAGE_TYPE.CARD_FAVORITE:
    case WEBSOCKET_MESSAGE_TYPE.COMMENT_ADDED:
    case WEBSOCKET_MESSAGE_TYPE.COMMENT_EDITED:
    case WEBSOCKET_MESSAGE_TYPE.COMMENT_DELETED:
    case WEBSOCKET_MESSAGE_TYPE.CARD_UPDATED: {
      const cardToUpdate = update.card;
      if (cardToUpdate && draft.cards) {
        const cardIndex = draft.cards.findIndex(
          (c: any) => c.id === cardToUpdate.id,
        );
        if (cardIndex !== -1) {
          const filteredUpdate = Object.fromEntries(
            Object.entries(cardToUpdate).filter(([, value]) => value !== null),
          );
          Object.assign(draft.cards[cardIndex], filteredUpdate);
        }
      }
      if (cardToUpdate && draft.sections) {
        draft.sections.forEach((section: any) => {
          if (section.cards) {
            const cardIndex = section.cards.findIndex(
              (c: any) => c.id === cardToUpdate.id,
            );
            if (cardIndex !== -1) {
              const filteredUpdate = Object.fromEntries(
                Object.entries(cardToUpdate).filter(
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

    case WEBSOCKET_MESSAGE_TYPE.CARD_DELETED: {
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

    case WEBSOCKET_MESSAGE_TYPE.SECTION_UPDATED: {
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
