import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
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
      if (
        update.cards &&
        draft.layoutType !== LAYOUT_TYPE.FREE &&
        draft.sections &&
        draft.sections.length > 0
      ) {
        const firstSection = draft.sections[0];
        if (firstSection.cards) {
          firstSection.cards = update.cards;
        }
      } else if (
        update.cards &&
        draft.layoutType === LAYOUT_TYPE.FREE &&
        draft.cards
      ) {
        draft.cards = update.cards;
      }
      break;
    }
    case WEBSOCKET_MESSAGE_TYPE.SECTIONS_DELETED:
    case WEBSOCKET_MESSAGE_TYPE.SECTION_DUPLICATED: {
      if (
        draft.sections &&
        update.board?.layoutType !== LAYOUT_TYPE.FREE &&
        update.board?.sections &&
        update.board?.sections.length
      ) {
        draft.sections = update.board.sections;
        draft.sectionIds = update.board.sectionIds;
      } else if (
        draft.cards &&
        update.board?.layoutType === LAYOUT_TYPE.FREE &&
        update.board?.cards &&
        update.board?.cards.length
      ) {
        draft.cards = update.board.cards;
        draft.cardIds = update.board.cardIds;
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

    case WEBSOCKET_MESSAGE_TYPE.CARDS_DELETED: {
      const cardIdsToDelete = update.cards?.map((card: any) => card._id) || [];
      console.log(cardIdsToDelete);
      if (draft.cards) {
        draft.cards = draft.cards.filter(
          (c: any) => !cardIdsToDelete.includes(c.id),
        );
        if (draft.cardIds) {
          draft.cardIds = draft.cardIds.filter(
            (id: any) => !cardIdsToDelete.includes(id),
          );
        }
      }
      if (draft.sections) {
        draft.sections.forEach((section: any) => {
          if (section.cards) {
            section.cards = section.cards.filter(
              (c: any) => !cardIdsToDelete.includes(c.id),
            );
          }
          if (section.cardIds) {
            section.cardIds = section.cardIds.filter(
              (id: any) => !cardIdsToDelete.includes(id),
            );
          }
        });
      }
      break;
    }
    case WEBSOCKET_MESSAGE_TYPE.SECTION_ADDED: {
      if (draft.sections && draft.sectionIds && update.section) {
        draft.sections.push(update.section);
        draft.sectionIds.push(update.section.id);
      }
      break;
    }
    case WEBSOCKET_MESSAGE_TYPE.SECTION_UPDATED: {
      if (draft.sections) {
        const sectionIndex = draft.sections.findIndex(
          (s: any) => s._id === update.section._id,
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

    case WEBSOCKET_MESSAGE_TYPE.CARD_DUPLICATED: {
      if (update.cards) {
        if (draft.sections) {
          draft.sections.forEach((section: any) => {
            if (section.cards) {
              section.cards = update.cards;
            }
          });
        } else if (draft.cards) {
          draft.cards = update.cards;
          if (draft.cardIds) {
            draft.cardIds = update.cards.map((card: any) => card.id);
          }
        }
      }
      break;
    }
  }
};
