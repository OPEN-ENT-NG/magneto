import React, { createContext, useContext, useEffect, ReactNode } from "react";

import useWebSocket from "react-use-websocket";

interface WebSocketUpdate {
  type: string;
  card?: any;
  cardId?: string;
  section?: any;
  sectionId?: string;
  [key: string]: any;
}

interface WebSocketContextValue {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: number;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  socketUrl: string;
  onMessage?: (update: WebSocketUpdate) => void;
}

// Registry pour les callbacks RTK Query
const cacheUpdateCallbacks = new Set<(update: WebSocketUpdate) => void>();

export const registerCacheUpdateCallback = (
  callback: (update: WebSocketUpdate) => void,
) => {
  cacheUpdateCallbacks.add(callback);
  return () => cacheUpdateCallbacks.delete(callback);
};

// Fonction de traitement des mises à jour (ton code existant)
const applyBoardUpdate = (draft: any, update: WebSocketUpdate) => {
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

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  socketUrl,
  onMessage,
}) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket connected"),
    onClose: () => console.log("WebSocket disconnected"),
    onError: (error: any) => console.error("WebSocket error:", error),
    shouldReconnect: () => true, // Reconnexion automatique
    reconnectInterval: 3000,
    reconnectAttempts: 10,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const update: WebSocketUpdate = JSON.parse(lastMessage.data);

        // Appeler le callback personnalisé si fourni
        if (onMessage) {
          onMessage(update);
        }

        // Notifier tous les callbacks RTK Query enregistrés
        cacheUpdateCallbacks.forEach((callback) => {
          callback(update);
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, onMessage]);

  const contextValue: WebSocketContextValue = {
    sendMessage,
    lastMessage,
    readyState,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider",
    );
  }
  return context;
};

// Hook pour utiliser avec RTK Query onCacheEntryAdded
export const useWebSocketCacheUpdater = () => {
  return (cacheLifecycleApi: any) => {
    const { updateCachedData, cacheDataLoaded, cacheEntryRemoved } =
      cacheLifecycleApi;

    cacheDataLoaded.then(() => {
      // S'enregistrer pour recevoir les mises à jour WebSocket
      const unsubscribe = registerCacheUpdateCallback(
        (update: WebSocketUpdate) => {
          updateCachedData((draft: any) => {
            applyBoardUpdate(draft, update);
          });
        },
      );

      // Nettoyer lors de la suppression du cache
      cacheEntryRemoved.then(unsubscribe);
    });
  };
};

// Export de la fonction applyBoardUpdate pour utilisation externe
export { applyBoardUpdate };
