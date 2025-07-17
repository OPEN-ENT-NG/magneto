import { ReactNode } from "react";

import { IUserInfo } from "@edifice.io/client";
import { ReadyState } from "react-use-websocket";

import { ICardItemResponse } from "~/models/card.model";

export interface WebSocketUpdate {
  type: string;
  card?: ICardItemResponse;
  cards?: ICardItemResponse[];
  cardId?: string;
  section?: any;
  sectionId?: string;
  board?: any;
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
