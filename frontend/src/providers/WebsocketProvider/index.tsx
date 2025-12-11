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
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
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

  const [activeSearchState, setActiveSearchState] = useState<{
    boardId: string | null;
    searchText: string;
    refetchCallback: (() => void) | null;
  }>({
    boardId: null,
    searchText: "",
    refetchCallback: null,
  });

  const {
    sendMessage: originalSendMessage,
    lastMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(
    shouldConnect && !isDisconnectedForInactivity ? socketUrl : null,
    {
      onOpen: () => {
        setIsDisconnectedForInactivity(false);
        lastWebSocketMessageRef.current = Date.now();
        startInactivityTimer();
      },

      onClose: () => {
        stopInactivityTimer();
      },

      shouldReconnect: () => {
        if (isDisconnectedForInactivity) {
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
      const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000; // 2h

      if (timeSinceLastMessage > INACTIVITY_TIMEOUT) {
        setIsDisconnectedForInactivity(true);

        const ws = getWebSocket();
        if (ws) {
          ws.close(1000, "No activity timeout");
        }
        toast.warning(t("magneto.websocket.afk"), {
          autoClose: 3600000,
        });

        stopInactivityTimer();
      }
    }, 30000);
  }, [getWebSocket, t]);

  const stopInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearInterval(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const registerActiveSearch = useCallback(
    (boardId: string, searchText: string, refetchCallback: () => void) => {
      setActiveSearchState({
        boardId,
        searchText,
        refetchCallback,
      });

      return () => {
        setActiveSearchState({
          boardId: null,
          searchText: "",
          refetchCallback: null,
        });
      };
    },
    [],
  );

  const shouldBlockCacheUpdate = useCallback(
    (update: WebSocketUpdate): boolean => {
      if (!activeSearchState.searchText || !activeSearchState.boardId) {
        return false;
      }

      const blockableTypes = ["boardMessage", "boardUpdated"];
      return blockableTypes.includes(update.type);
    },
    [activeSearchState],
  );

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

        if (update.type === "disconnection" && update.userId) {
          setConnectedUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== update.userId),
          );

          setCardEditing((prevEditing) =>
            prevEditing.filter((editing) => editing.userId !== update.userId),
          );
        }

        if (update.type === "cardEditing" && update.cardEditingInformations) {
          setCardEditing(update.cardEditingInformations);
        }

        if (activeSearchState.searchText && activeSearchState.refetchCallback) {
          const shouldRefetch = [
            WEBSOCKET_MESSAGE_TYPE.BOARD_MESSAGE,
            WEBSOCKET_MESSAGE_TYPE.BOARD_UPDATED,
          ].includes(update.type as WEBSOCKET_MESSAGE_TYPE);

          if (shouldRefetch) {
            activeSearchState.refetchCallback();
          }
        }

        if (onMessage) {
          onMessage(update);
        }

        if (!shouldBlockCacheUpdate(update)) {
          notifyCacheUpdateCallbacks(update);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    }
  }, [lastMessage, onMessage, activeSearchState, shouldBlockCacheUpdate]);

  const contextValue: WebSocketContextValue = {
    sendMessage,
    lastMessage,
    readyState,
    connectedUsers,
    cardEditing,
    registerActiveSearch,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};
