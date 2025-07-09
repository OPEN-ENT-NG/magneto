import {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  FC,
  useCallback,
  useMemo,
} from "react";

import useWebSocket from "react-use-websocket";

// Définir les interfaces
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
  applyBoardUpdate: (draft: any, update: WebSocketUpdate) => void;
  registerCacheUpdateCallback: (
    callback: (update: WebSocketUpdate) => void,
  ) => () => void;
  useWebSocketCacheUpdater: () => (cacheLifecycleApi: any) => void;
}

// Créer le contexte
const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  socketUrl: string;
  onMessage?: (update: WebSocketUpdate) => void;
}

export const WebSocketProvider: FC<WebSocketProviderProps> = ({
  children,
  socketUrl,
  onMessage,
}) => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log("WebSocket connected"),
    onClose: () => console.log("WebSocket disconnected"),
    onError: (error: any) => console.error("WebSocket error:", error),
    shouldReconnect: () => true,
    reconnectInterval: 3000,
    reconnectAttempts: 10,
  });

  // Registry pour les callbacks RTK Query
  const cacheUpdateCallbacks = useMemo(
    () => new Set<(update: WebSocketUpdate) => void>(),
    [],
  );

  const applyBoardUpdate = useCallback(
    (draft: any, update: WebSocketUpdate) => {
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
                Object.entries(update.card).filter(
                  ([, value]) => value !== null,
                ),
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
            draft.cards = draft.cards.filter(
              (c: any) => c.id !== cardIdToDelete,
            );
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
              (s: any) => s.id === update.section.id,
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
    },
    [],
  );

  const registerCacheUpdateCallback = useCallback(
    (callback: (update: WebSocketUpdate) => void) => {
      cacheUpdateCallbacks.add(callback);
      return () => {
        cacheUpdateCallbacks.delete(callback);
      };
    },
    [cacheUpdateCallbacks],
  );

  const useWebSocketCacheUpdater = useCallback(() => {
    return (cacheLifecycleApi: any) => {
      const { updateCachedData, cacheDataLoaded, cacheEntryRemoved } =
        cacheLifecycleApi;

      cacheDataLoaded.then(() => {
        const unsubscribe = registerCacheUpdateCallback(
          (update: WebSocketUpdate) => {
            updateCachedData((draft: any) => {
              applyBoardUpdate(draft, update);
            });
          },
        );

        cacheEntryRemoved.then(unsubscribe);
      });
    };
  }, [registerCacheUpdateCallback, applyBoardUpdate]);

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const update: WebSocketUpdate = JSON.parse(lastMessage.data);

        if (onMessage) {
          onMessage(update);
        }

        cacheUpdateCallbacks.forEach((callback) => {
          callback(update);
        });
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, onMessage, cacheUpdateCallbacks]);

  const contextValue: WebSocketContextValue = useMemo(
    () => ({
      sendMessage,
      lastMessage,
      readyState,
      applyBoardUpdate,
      registerCacheUpdateCallback,
      useWebSocketCacheUpdater,
    }),
    [
      sendMessage,
      lastMessage,
      readyState,
      applyBoardUpdate,
      registerCacheUpdateCallback,
      useWebSocketCacheUpdater,
    ],
  );

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
