import React, { createContext, useContext, useEffect, useState } from "react";

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

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    shouldConnect ? socketUrl : null,
    {
      onOpen: () => console.log("WebSocket connected"),
      onClose: () => console.log("WebSocket disconnected"),
      onError: (error: any) => console.error("WebSocket error:", error),
      shouldReconnect: () => shouldConnect,
      reconnectInterval: 3000,
      reconnectAttempts: 10,
    },
  );

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

  useEffect(() => {
    console.log(cardEditing);
  }, [cardEditing]);

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
