import { Dispatch, ReactNode, SetStateAction } from "react";

import { RightRole } from "edifice-ts-client";

import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
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
  isLoading: boolean;
  boardRights: Record<RightRole, boolean> | null;
  hasEditRights: () => boolean;
  dispayModals: DisplayModalsState;
  toggleBoardModals: (modalType: BOARD_MODAL_TYPE) => void;
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

export interface DisplayModalsState {
  [BOARD_MODAL_TYPE.PARAMETERS]: boolean;
}
