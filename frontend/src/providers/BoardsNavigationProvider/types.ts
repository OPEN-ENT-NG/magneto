import { Dispatch, ReactNode, SetStateAction } from "react";

import { Board } from "~/models/board.model";

export interface BoardsNavigationProviderProps {
  children: ReactNode;
}

export type BoardsNavigationContextType = {
  boards: Board[];
  setBoards: Dispatch<SetStateAction<Board[]>>;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
};

