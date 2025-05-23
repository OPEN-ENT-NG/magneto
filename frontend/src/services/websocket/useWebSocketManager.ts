import { useCallback, useEffect } from "react";

export type UpdateHandler = (update: any) => void;

export interface WebSocketSubscription {
  id: string;
  handler: UpdateHandler;
}

interface WebSocketState {
  socket: WebSocket | null;
  subscriptions: Map<string, WebSocketSubscription[]>;
  isConnected: boolean;
  reconnectAttempts: number;
  connectionPromise: Promise<void> | null;
}

// Store global partagé (sans classe)
const globalWebSocketState: WebSocketState = {
  socket: null,
  subscriptions: new Map(),
  isConnected: false,
  reconnectAttempts: 0,
  connectionPromise: null,
};

const MAX_RECONNECT_ATTEMPTS = 5;

const handleMessage = (message: any) => {
  const { type, boardId } = message;

  // Pour les actions liées à un board, on route vers boards:boardId
  if (boardId) {
    const subscriptionKey = `boards:${boardId}`;
    const subscribers = globalWebSocketState.subscriptions.get(subscriptionKey);

    if (subscribers) {
      subscribers.forEach((sub) => sub.handler(message));
    }

    // Également notifier les subscribers génériques pour boards
    const genericKey = `boards:*`;
    const genericSubscribers =
      globalWebSocketState.subscriptions.get(genericKey);
    if (genericSubscribers) {
      genericSubscribers.forEach((sub) => sub.handler(message));
    }
  }
};

const attemptReconnect = (url: string) => {
  if (globalWebSocketState.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error("Max reconnection attempts reached");
    return;
  }

  const delay = Math.pow(2, globalWebSocketState.reconnectAttempts) * 1000;
  globalWebSocketState.reconnectAttempts++;

  setTimeout(() => {
    console.log(
      `Reconnecting... Attempt ${globalWebSocketState.reconnectAttempts}`,
    );
    connectWebSocket(url);
  }, delay);
};

const connectWebSocket = (
  url: string = "ws://localhost:9091/9340ed52-ede0-4a62-a783-a448e0d5729e",
): Promise<void> => {
  if (globalWebSocketState.connectionPromise) {
    return globalWebSocketState.connectionPromise;
  }

  globalWebSocketState.connectionPromise = new Promise((resolve, reject) => {
    try {
      globalWebSocketState.socket = new WebSocket(url);

      globalWebSocketState.socket.onopen = () => {
        console.log("WebSocket connected");
        globalWebSocketState.isConnected = true;
        globalWebSocketState.reconnectAttempts = 0;
        resolve();
      };

      globalWebSocketState.socket.onmessage = (event) => {
        console.log("Message reçu, ", JSON.parse(event.data));
        handleMessage(JSON.parse(event.data));
      };

      globalWebSocketState.socket.onclose = () => {
        console.log("WebSocket disconnected");
        globalWebSocketState.isConnected = false;
        globalWebSocketState.connectionPromise = null;
        attemptReconnect(url);
      };

      globalWebSocketState.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };
    } catch (error) {
      reject(error);
    }
  });

  return globalWebSocketState.connectionPromise;
};

export const useWebSocketManager = () => {
  const subscribe = useCallback(
    (
      resource: string,
      resourceId: string = "*",
      handler: UpdateHandler,
    ): (() => void) => {
      const subscriptionKey = `${resource}:${resourceId}`;
      const subscriptionId = `${subscriptionKey}:${Date.now()}:${Math.random()}`;

      const subscription: WebSocketSubscription = {
        id: subscriptionId,
        handler,
      };

      if (!globalWebSocketState.subscriptions.has(subscriptionKey)) {
        globalWebSocketState.subscriptions.set(subscriptionKey, []);
      }

      globalWebSocketState.subscriptions
        .get(subscriptionKey)!
        .push(subscription);

      return () => {
        const subs = globalWebSocketState.subscriptions.get(subscriptionKey);
        if (subs) {
          const index = subs.findIndex((s) => s.id === subscriptionId);
          if (index !== -1) {
            subs.splice(index, 1);
            if (subs.length === 0) {
              globalWebSocketState.subscriptions.delete(subscriptionKey);
            }
          }
        }
      };
    },
    [],
  );

  const connect = useCallback(async (url?: string) => {
    return connectWebSocket(url);
  }, []);

  const disconnect = useCallback(() => {
    globalWebSocketState.socket?.close();
    globalWebSocketState.socket = null;
    globalWebSocketState.isConnected = false;
    globalWebSocketState.connectionPromise = null;
    globalWebSocketState.subscriptions.clear();
  }, []);

  const send = useCallback((message: any) => {
    if (globalWebSocketState.socket && globalWebSocketState.isConnected) {
      globalWebSocketState.socket.send(JSON.stringify(message));
    }
  }, []);

  return {
    subscribe,
    connect,
    disconnect,
    send,
    isConnected: globalWebSocketState.isConnected,
  };
};

// Hook pour la connexion automatique
export const useWebSocketConnection = (url?: string) => {
  const { connect, disconnect } = useWebSocketManager();

  useEffect(() => {
    connect(url).catch(console.error);

    return () => {
      disconnect();
    };
  }, [connect, disconnect, url]);
};

export const createRTKWebSocketIntegration = () => {
  const ensureConnection = async () => {
    await connectWebSocket();
  };

  const createOnCacheEntryAdded =
    (resource: string, resourceId?: string) =>
    async (
      arg: any,
      { updateCachedData, cacheDataLoaded, cacheEntryRemoved }: any,
    ) => {
      await Promise.all([cacheDataLoaded, ensureConnection()]);

      const targetResourceId =
        resourceId || arg.boardId || arg.cardId || arg.userId || "all";

      // Utiliser directement la fonction subscribe globale
      const unsubscribe = subscribeToWebSocket(
        resource,
        targetResourceId,
        (update) => {
          updateCachedData((draft: any) => {
            applyUpdateToDraft(draft, update, resource);
          });
        },
      );

      await cacheEntryRemoved;
      unsubscribe();
    };

  return { createOnCacheEntryAdded };
};

// Fonction globale pour subscribe (sans hook)
const subscribeToWebSocket = (
  resource: string,
  resourceId: string = "*",
  handler: UpdateHandler,
): (() => void) => {
  const subscriptionKey = `${resource}:${resourceId}`;
  const subscriptionId = `${subscriptionKey}:${Date.now()}:${Math.random()}`;

  const subscription: WebSocketSubscription = {
    id: subscriptionId,
    handler,
  };

  if (!globalWebSocketState.subscriptions.has(subscriptionKey)) {
    globalWebSocketState.subscriptions.set(subscriptionKey, []);
  }

  globalWebSocketState.subscriptions.get(subscriptionKey)!.push(subscription);

  return () => {
    const subs = globalWebSocketState.subscriptions.get(subscriptionKey);
    if (subs) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          globalWebSocketState.subscriptions.delete(subscriptionKey);
        }
      }
    }
  };
};

// Fonction helper pour appliquer les mises à jour selon le type de resource
const applyUpdateToDraft = (draft: any, update: any, resource: string) => {
  switch (resource) {
    case "boards":
      applyBoardUpdate(draft, update);
      break;
    case "cards":
      applyCardUpdate(draft, update);
      break;
    case "users":
      applyUserUpdate(draft, update);
      break;
    default:
      console.warn(`Unknown resource type: ${resource}`);
  }
};

const applyBoardUpdate = (draft: any, update: any) => {
  switch (update.type) {
    case "cardAdded": {
      const newCard = update.card;
      if (draft.sections && newCard.sectionId) {
        // Board avec sections - ajouter la carte à la bonne section
        const section = draft.sections.find(
          (s: any) => s._id === newCard.sectionId,
        );
        if (section && section.cards) {
          section.cards.unshift(newCard);
        }
      } else if (draft.cards) {
        // Board libre - ajouter la carte au tableau principal
        draft.cards.unshift(newCard);
        // Mettre à jour cardIds si présent
        if (draft.cardIds) {
          draft.cardIds.unshift(newCard.id);
        }
      }
      break;
    }

    case "cardUpdated": {
      // Gérer la mise à jour d'une carte existante
      if (draft.cards) {
        const cardIndex = draft.cards.findIndex(
          (c: any) => c.id === update.card.id,
        );
        if (cardIndex !== -1) {
          draft.cards[cardIndex] = {
            ...draft.cards[cardIndex],
            ...update.card,
          };
        }
      }
      // Aussi checker dans les sections
      if (draft.sections) {
        draft.sections.forEach((section: any) => {
          if (section.cards) {
            const cardIndex = section.cards.findIndex(
              (c: any) => c.id === update.card.id,
            );
            if (cardIndex !== -1) {
              section.cards[cardIndex] = {
                ...section.cards[cardIndex],
                ...update.card,
              };
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

    // ... autres cases existants
  }
};

const applyCardUpdate = (draft: any, update: any) => {
  // Logique spécifique aux cartes
  if (update.type === "CARD_UPDATE") {
    Object.assign(draft, update.data);
  }
};

const applyUserUpdate = (draft: any, update: any) => {
  // Logique spécifique aux utilisateurs
  if (update.type === "USER_UPDATE") {
    Object.assign(draft, update.data);
  }
};

const handleCardMove = (draft: any, moveData: any) => {
  // Implémentation du déplacement de cartes entre sections
  const { cardId, fromSectionId, toSectionId, newPosition } = moveData;

  if (draft.sections) {
    const fromSection = draft.sections.find(
      (s: any) => s._id === fromSectionId,
    );
    const toSection = draft.sections.find((s: any) => s._id === toSectionId);

    if (fromSection && toSection) {
      const cardIndex = fromSection.cards.findIndex(
        (c: any) => c.id === cardId,
      );
      if (cardIndex !== -1) {
        const [card] = fromSection.cards.splice(cardIndex, 1);
        toSection.cards.splice(newPosition, 0, card);
      }
    }
  }
};
