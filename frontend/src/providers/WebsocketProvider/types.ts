import { ReactNode } from "react";

import { IUserInfo } from "@edifice.io/client";
import { ReadyState } from "react-use-websocket";

export interface WebSocketUpdate {
  type: string;
  card?: any;
  cardId?: string;
  section?: any;
  sectionId?: string;
  connectedUsers?: IUserInfo[];
  [key: string]: any;
}

export interface WebSocketContextValue {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent | null;
  readyState: ReadyState;
  connectedUsers: IUserInfo[];
}

export interface WebSocketProviderProps {
  children: ReactNode;
  socketUrl: string;
  onMessage?: (update: WebSocketUpdate) => void;
  shouldConnect?: boolean;
}
