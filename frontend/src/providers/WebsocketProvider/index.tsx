import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";

import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
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
  const [isDisconnectedForInactivity, setIsDisconnectedForInactivity] =
    useState(false);
  const lastWebSocketMessageRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation("magneto");

  const {
    sendMessage: originalSendMessage,
    lastMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(
    shouldConnect && !isDisconnectedForInactivity ? socketUrl : null,
    {
      onOpen: () => {
        console.log("✅ WebSocket connected");
        setIsDisconnectedForInactivity(false);
        lastWebSocketMessageRef.current = Date.now();
        startInactivityTimer();
      },

      onClose: (event) => {
        console.log("🔴 WebSocket disconnected");
        console.log("📊 Close code:", event.code);
        console.log("📝 Close reason:", event.reason);
        stopInactivityTimer();
      },

      onError: (event: any) => {
        console.error("❌ WebSocket error:", event);
      },

      shouldReconnect: () => {
        if (isDisconnectedForInactivity) {
          console.log("🚫 Not reconnecting - disconnected for inactivity");
          return false;
        }
        return shouldConnect;
      },

      reconnectInterval: 3000,
      reconnectAttempts: 10,
    },
  );

  const sendMessage = useCallback(
    (message: string) => {
      lastWebSocketMessageRef.current = Date.now();
      console.log("📤 Sending WebSocket message, resetting inactivity timer");

      if (isDisconnectedForInactivity) {
        setIsDisconnectedForInactivity(false);
      }

      originalSendMessage(message);
    },
    [originalSendMessage, isDisconnectedForInactivity],
  );

  const startInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setInterval(() => {
      const timeSinceLastMessage = Date.now() - lastWebSocketMessageRef.current;
      const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastMessage > INACTIVITY_TIMEOUT) {
        console.log(
          `⏰ No WebSocket messages sent for ${Math.round(
            timeSinceLastMessage / 1000,
          )}s - disconnecting`,
        );

        setIsDisconnectedForInactivity(true);

        const ws = getWebSocket();
        if (ws) {
          ws.close(1000, "No activity timeout");
        }
        toast(t("magneto.websocket.afk"));

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

        if (onMessage) {
          onMessage(update);
        }

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
