import React, { createContext, useContext, useEffect, useState } from "react";

import { IUserInfo } from "@edifice.io/client";
import useWebSocket from "react-use-websocket";

import {
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
  const [connectedUsers, setConnectedUsers] = useState<IUserInfo[]>([]);

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
    if (lastMessage !== null) {
      try {
        const update: WebSocketUpdate = JSON.parse(lastMessage.data);

        if (update.type === "metadata" && update.connectedUsers) {
          setConnectedUsers(update.connectedUsers);
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
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
