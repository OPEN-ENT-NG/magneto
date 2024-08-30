import { Dispatch, ReactNode, SetStateAction } from "react";

import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";

export interface BoardProviderProps {
  children: ReactNode;
}

export type BoardContextType = {
  board: Board;
  setBoard: Dispatch<SetStateAction<Board>>;
};

export type Section = {
  id: string;
  title: string;
  cardIds: Array<string>;
  boardId: string;
  page: number;
  cards: Card[];
  displayed?: boolean;
};

export type Sections = {
  all: Section[];
};
