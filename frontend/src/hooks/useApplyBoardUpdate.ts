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

const handleCardAdded = (draft: any, update: WebSocketUpdate) => {
  if (
    update.cards &&
    draft.layoutType !== LAYOUT_TYPE.FREE &&
    !!draft.sections.length
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
};

const handleSectionsDeletedOrDuplicated = (
  draft: any,
  update: WebSocketUpdate,
) => {
  if (
    draft.sections &&
    update.board?.layoutType !== LAYOUT_TYPE.FREE &&
    !!update.board?.sections.length &&
    !!update.board?.sectionIds.length
  ) {
    draft.sections = update.board.sections;
    draft.sectionIds = update.board.sectionIds;
  } else if (
    draft.cards &&
    update.board?.layoutType === LAYOUT_TYPE.FREE &&
    !!update.board?.cards.length
  ) {
    draft.cards = update.board.cards;
    draft.cardIds = update.board.cardIds;
  }
};

const handleCardFavoriteOrComment = (draft: any, update: WebSocketUpdate) => {
  const cardToUpdate = update.card;
  if (cardToUpdate && draft.cards) {
    const cardIndex = draft.cards.findIndex(
      (c: any) => c.id === cardToUpdate._id,
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
          (c: any) => c.id === cardToUpdate._id,
        );
        if (cardIndex !== -1) {
          const filteredUpdate = Object.fromEntries(
            Object.entries(cardToUpdate).filter(([, value]) => value !== null),
          );
          Object.assign(section.cards[cardIndex], {
            ...filteredUpdate,
            ...(filteredUpdate.isLocked !== undefined && {
              locked: filteredUpdate.isLocked,
            }),
            ...(filteredUpdate.isLiked !== undefined && {
              liked: filteredUpdate.isLiked,
            }),
          });
        }
      }
    });
  }
};

const handleCardsDeleted = (draft: any, update: WebSocketUpdate) => {
  const cardIdsToDelete = update.cards?.map((card: any) => card._id) || [];
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
};

const handleSectionAdded = (draft: any, update: WebSocketUpdate) => {
  if (draft.sections && draft.sectionIds && update.section) {
    draft.sections = [...draft.sections, update.section];
    draft.sectionIds = [...draft.sectionIds, update.section.id];
  }
};

const handleSectionUpdated = (draft: any, update: WebSocketUpdate) => {
  if (draft.sections) {
    const sectionIndex = draft.sections.findIndex(
      (s: any) => s._id === update.section._id,
    );
    if (sectionIndex !== -1) {
      Object.entries(update.section).forEach(([key, value]) => {
        if (value !== null) {
          draft.sections[sectionIndex][key] = value;
        }
      });
    }
  }
};

const handleCardDuplicated = (draft: any, update: WebSocketUpdate) => {
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
};

export const applyBoardUpdate = (draft: any, update: WebSocketUpdate) => {
  switch (update.type) {
    case WEBSOCKET_MESSAGE_TYPE.CARD_ADDED:
      handleCardAdded(draft, update);
      break;
    case WEBSOCKET_MESSAGE_TYPE.SECTIONS_DELETED:
    case WEBSOCKET_MESSAGE_TYPE.SECTION_DUPLICATED:
    case WEBSOCKET_MESSAGE_TYPE.CARD_MOVED:
      handleSectionsDeletedOrDuplicated(draft, update);
      break;
    case WEBSOCKET_MESSAGE_TYPE.CARD_FAVORITE:
    case WEBSOCKET_MESSAGE_TYPE.COMMENT_ADDED:
    case WEBSOCKET_MESSAGE_TYPE.COMMENT_EDITED:
    case WEBSOCKET_MESSAGE_TYPE.COMMENT_DELETED:
    case WEBSOCKET_MESSAGE_TYPE.CARD_UPDATED:
      handleCardFavoriteOrComment(draft, update);
      break;
    case WEBSOCKET_MESSAGE_TYPE.CARDS_DELETED:
      handleCardsDeleted(draft, update);
      break;
    case WEBSOCKET_MESSAGE_TYPE.SECTION_ADDED:
      handleSectionAdded(draft, update);
      break;
    case WEBSOCKET_MESSAGE_TYPE.SECTION_UPDATED:
      handleSectionUpdated(draft, update);
      break;
    case WEBSOCKET_MESSAGE_TYPE.CARD_DUPLICATED:
      handleCardDuplicated(draft, update);
      break;
  }
};
