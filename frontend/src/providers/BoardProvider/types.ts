import { Dispatch, ReactNode, SetStateAction } from "react";

import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";

export interface BoardProviderProps {
  children: ReactNode;
}

export type BoardContextType = {
  board: Board;
  zoomLevel: number;
  setZoomLevel: Dispatch<SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
};

export type Section = {
  _id: string;
  title: string;
  cardIds: string[];
  boardId: string;
  page: number;
  cards: Card[];
  displayed?: boolean;
};

export type Sections = {
  all: Section[];
};
