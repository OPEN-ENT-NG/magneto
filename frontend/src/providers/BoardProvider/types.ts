import { Dispatch, ReactNode, SetStateAction } from "react";

import { RightRole, WorkspaceElement } from "edifice-ts-client";

import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { Board } from "~/models/board.model";
import { Card } from "~/models/card.model";

export interface BoardProviderProps {
  children: ReactNode;
}

export type BoardContextType = {
  board: Board;
  documents: WorkspaceElement[];
  zoomLevel: number;
  setZoomLevel: Dispatch<SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  isLoading: boolean;
  isFetching: boolean;
  boardRights: Record<RightRole, boolean> | null;
  hasContribRights: () => boolean;
  hasEditRights: () => boolean;
  hasManageRights: () => boolean;
  displayModals: DisplayModalsState;
  toggleBoardModals: (modalType: BOARD_MODAL_TYPE) => void;
  isFileDragging: boolean;
  setIsFileDragging: Dispatch<SetStateAction<boolean>>;
  activeCard: Card | null;
  setActiveCard: Dispatch<SetStateAction<Card | null>>;
  isModalDuplicate: boolean;
  setIsModalDuplicate: Dispatch<SetStateAction<boolean>>;
  cleanActiveCard: () => void;
  openActiveCardAction: (card: Card, actionType: BOARD_MODAL_TYPE) => void;
  closeActiveCardAction: (actionType: BOARD_MODAL_TYPE) => void;
  behaviours: any;
  boardImages: any; //TODO : type
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
  [BOARD_MODAL_TYPE.COMMENT_PANEL]: boolean;
  [BOARD_MODAL_TYPE.CARD_PREVIEW]: boolean;
  [BOARD_MODAL_TYPE.DELETE]: boolean;
  [BOARD_MODAL_TYPE.DUPLICATE_OR_MOVE]: boolean;
  [BOARD_MODAL_TYPE.CREATE_EDIT]: boolean;
  [BOARD_MODAL_TYPE.BOARD_SELECTION]: boolean;
}
