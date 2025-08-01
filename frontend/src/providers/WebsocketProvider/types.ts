import { ReactNode } from "react";

import { ReadyState } from "react-use-websocket";

import { IBoardItemResponse } from "~/models/board.model";
import { ICardItemResponse } from "~/models/card.model";

export interface User {
  id: string;
  username: string;
}

export interface WebSocketUpdate {
  type: string;
  card?: ICardItemResponse;
  cards?: ICardItemResponse[];
  cardId?: string;
  section?: any;
  sectionId?: string;
  board?: IBoardItemResponse;
  connectedUsers?: UserCollaboration[];
  cardEditingInformations?: CardEditing[];
  [key: string]: any;
}

export interface WebSocketContextValue {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent | null;
  readyState: ReadyState;
  connectedUsers: UserCollaboration[];
  cardEditing: CardEditing[];
}

export interface WebSocketProviderProps {
  children: ReactNode;
  socketUrl: string;
  onMessage?: (update: WebSocketUpdate) => void;
  shouldConnect?: boolean;
}

export interface UserCollaboration {
  id: string;
  username: string;
  color: string;
}

export interface CardEditing {
  userId: string;
  cardId: string;
  since: number;
  isMoving: boolean;
}
