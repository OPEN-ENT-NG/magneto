import { Dispatch, ReactNode, SetStateAction } from "react";

import { Board } from "~/models/board.model";

export interface BoardsNavigationProviderProps {
  children: ReactNode;
}

export interface TriggerFetchBoardState {
  myBoards: boolean;
  myAllBoards: boolean;
}

export type BoardsNavigationContextType = {
  boards: Board[];
  setBoards: Dispatch<SetStateAction<Board[]>>;
};

