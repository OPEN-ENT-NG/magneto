import { useCallback, useEffect } from "react";

export type UpdateHandler = (update: any) => void;

export interface WebSocketSubscription {
  id: string;
  handler: UpdateHandler;
}

interface WebSocketState {
  socket: WebSocket | null;
  subscriptions: Record<string, WebSocketSubscription[]>; // Changé de Map vers Record
  isConnected: boolean;
  reconnectAttempts: number;
  connectionPromise: Promise<void> | null;
}

// Store global partagé (sans classe)
const globalWebSocketState: WebSocketState = {
  socket: null,
  subscriptions: {}, // Changé de new Map() vers {}
  isConnected: false,
  reconnectAttempts: 0,
  connectionPromise: null,
};

const MAX_RECONNECT_ATTEMPTS = 5;

const handleMessage = (message: any) => {
  console.log("Handling message:", message);

  // Pour les actions liées à un board, on route vers boards:boardId
  if (message.boardId) {
    const subscriptionKey = `boards:${message.boardId}`;
    console.log(`Looking for subscribers for key: ${subscriptionKey}`);

    // Debug de l'état des subscriptions
    console.log(
      "Available subscription keys:",
      Array.from(globalWebSocketState.subscriptions.keys()),
    );
    console.log(
      "Total subscriptions count:",
      globalWebSocketState.subscriptions.size,
    );

    const subscribers = globalWebSocketState.subscriptions.get(subscriptionKey);
    console.log(
      `Found ${
        subscribers ? subscribers.length : 0
      } subscribers for ${subscriptionKey}`,
    );

    if (subscribers) {
      console.log(`Notifying ${subscribers.length} subscribers`);
      subscribers.forEach((sub, index) => {
        console.log(`Calling handler ${index} for subscription ${sub.id}`);
        sub.handler(message);
      });
    } else {
      console.warn(`No subscribers found for ${subscriptionKey}`);
    }

    // Également notifier les subscribers génériques pour boards
    const genericKey = `boards:*`;
    const genericSubscribers =
      globalWebSocketState.subscriptions.get(genericKey);
    if (genericSubscribers) {
      console.log(`Notifying ${genericSubscribers.length} generic subscribers`);
      genericSubscribers.forEach((sub) => sub.handler(message));
    }
  } else {
    console.log("Message has no boardId, skipping routing");
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
  url: string = "ws://localhost:9091/",
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
        // NE PAS réinitialiser les subscriptions ici !
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
        // NE PAS réinitialiser les subscriptions lors de la déconnexion !
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

// Version modifiée pour supporter le boardId
export const createRTKWebSocketIntegration = (boardId?: string) => {
  const ensureConnection = async () => {
    // Construire l'URL avec le boardId si fourni
    const url = boardId
      ? `ws://localhost:9091/?boardId=${boardId}`
      : "ws://localhost:9091/";
    await connectWebSocket(url);
  };

  const createOnCacheEntryAdded =
    (resource: string, resourceId?: string) =>
    async (
      arg: any,
      { updateCachedData, cacheDataLoaded, cacheEntryRemoved }: any,
    ) => {
      // Attendre que le cache soit chargé et que la connexion soit établie
      await Promise.all([cacheDataLoaded, ensureConnection()]);

      const targetResourceId =
        resourceId || arg.boardId || arg.cardId || arg.userId || "all";

      console.log(`Subscribing to ${resource}:${targetResourceId}`);

      // Utiliser directement la fonction subscribe globale
      const unsubscribe = subscribeToWebSocket(
        resource,
        targetResourceId,
        (update) => {
          console.log(
            `Received update for ${resource}:${targetResourceId}`,
            update,
          );
          updateCachedData((draft: any) => {
            applyUpdateToDraft(draft, update, resource);
          });
        },
      );

      // Debug: vérifier les subscriptions
      console.log("Current subscriptions:", globalWebSocketState.subscriptions);

      // Attendre que le cache soit supprimé AVANT d'unsubscribe
      try {
        await cacheEntryRemoved;
      } finally {
        // Cleanup: unsubscribe quand le cache est supprimé
        console.log(`Unsubscribing from ${resource}:${targetResourceId}`);
        unsubscribe();
      }
    };

  return { createOnCacheEntryAdded };
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

      if (!globalWebSocketState.subscriptions[subscriptionKey]) {
        globalWebSocketState.subscriptions[subscriptionKey] = [];
      }

      globalWebSocketState.subscriptions[subscriptionKey].push(subscription);

      return () => {
        const subs = globalWebSocketState.subscriptions[subscriptionKey];
        if (subs) {
          const index = subs.findIndex((s) => s.id === subscriptionId);
          if (index !== -1) {
            subs.splice(index, 1);
            if (subs.length === 0) {
              delete globalWebSocketState.subscriptions[subscriptionKey];
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
    // Ne vider les subscriptions que lors d'une déconnexion volontaire
    globalWebSocketState.subscriptions = {};
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

  console.log(
    `Creating subscription: ${subscriptionKey} with ID: ${subscriptionId}`,
  );

  if (!globalWebSocketState.subscriptions.has(subscriptionKey)) {
    globalWebSocketState.subscriptions.set(subscriptionKey, []);
    console.log(`Created new subscription array for: ${subscriptionKey}`);
  }

  const subscriptions =
    globalWebSocketState.subscriptions.get(subscriptionKey)!;
  subscriptions.push(subscription);

  console.log(
    `Added subscription. Total for ${subscriptionKey}: ${subscriptions.length}`,
  );
  console.log(
    "Current subscription keys:",
    Array.from(globalWebSocketState.subscriptions.keys()),
  );

  return () => {
    console.log(`Unsubscribing: ${subscriptionId}`);
    const subs = globalWebSocketState.subscriptions.get(subscriptionKey);
    if (subs) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        console.log(
          `Removed subscription ${subscriptionId}. Remaining: ${subs.length}`,
        );
        if (subs.length === 0) {
          globalWebSocketState.subscriptions.delete(subscriptionKey);
          console.log(`Deleted empty subscription key: ${subscriptionKey}`);
        }
      } else {
        console.warn(
          `Subscription ${subscriptionId} not found for unsubscribe`,
        );
      }
    } else {
      console.warn(`No subscriptions found for key: ${subscriptionKey}`);
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

    case "boardUpdated": {
      if (draft.board && update.board) {
        draft.board = {
          ...draft.board,
          ...update.board,
        };
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
