import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import useWebSocket from "react-use-websocket";

import {
  CardEditing,
  UserCollaboration,
  WebSocketContextValue,
  WebSocketProviderProps,
  WebSocketUpdate,
} from "./types";
import { notifyCacheUpdateCallbacks } from "~/hooks/useApplyBoardUpdate";

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export const useWebSocketMagneto = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  socketUrl,
  onMessage,
  shouldConnect = true,
}) => {
  const [connectedUsers, setConnectedUsers] = useState<UserCollaboration[]>([]);
  const [cardEditing, setCardEditing] = useState<CardEditing[]>([]);
  const lastWebSocketMessageRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    sendMessage: originalSendMessage,
    lastMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(shouldConnect ? socketUrl : null, {
    onOpen: () => {
      console.log("✅ WebSocket connected");
      lastWebSocketMessageRef.current = Date.now();
      startInactivityTimer();
    },

    onClose: () => {
      console.log("🔴 WebSocket disconnected");
      stopInactivityTimer();
    },

    shouldReconnect: () => shouldConnect,
    reconnectInterval: 3000,
    reconnectAttempts: 10,
  });

  // Wrapper du sendMessage pour tracker l'activité
  const sendMessage = useCallback(
    (message: string) => {
      lastWebSocketMessageRef.current = Date.now(); // ← Reset timer à chaque envoi
      console.log("📤 Sending WebSocket message, resetting inactivity timer");
      originalSendMessage(message);
    },
    [originalSendMessage],
  );

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastWebSocketMessageRef.current;
      const INACTIVITY_TIMEOUT = 4.9 * 60 * 1000; // 4min54, vu qu'on check cette condition toutes les 30s ça finira à 5mins

      if (timeSinceLastMessage > INACTIVITY_TIMEOUT) {
        console.log(
          `⏰ No WebSocket messages sent for ${Math.round(
            timeSinceLastMessage / 1000,
          )}s - disconnecting`,
        );
        const ws = getWebSocket();
        if (ws) {
          ws.close(1000, "No activity timeout");
        }
        stopInactivityTimer();
      } else {
        console.log(
          `🕐 Time since last WebSocket message: ${Math.round(
            timeSinceLastMessage / 1000,
          )}s`,
        );
      }
    }, 30000); // Vérifier toutes les 30 secondes
  }, [getWebSocket]);

  const stopInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Nettoyer à la destruction
  useEffect(() => {
    return () => {
      stopInactivityTimer();
    };
  }, [stopInactivityTimer]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const update: WebSocketUpdate = JSON.parse(lastMessage.data);

        if (update.type === "connectedUsers" && update.connectedUsers) {
          setConnectedUsers(update.connectedUsers);
        }

        if (update.type === "cardEditing" && update.cardEditingInformations) {
          setCardEditing(update.cardEditingInformations);
        }

        // Appeler le callback personnalisé si fourni
        if (onMessage) {
          onMessage(update);
        }

        // Notifier tous les callbacks RTK Query enregistrés
        notifyCacheUpdateCallbacks(update);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, onMessage]);

  const contextValue: WebSocketContextValue = {
    sendMessage,
    lastMessage,
    readyState,
    connectedUsers,
    cardEditing,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
