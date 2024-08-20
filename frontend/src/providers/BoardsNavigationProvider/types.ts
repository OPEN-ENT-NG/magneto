import { RightRole } from "edifice-ts-client";
import { Dispatch, ReactNode, SetStateAction } from "react";

import { Board } from "~/models/board.model";

export interface BoardsNavigationProviderProps {
  children: ReactNode;
}

export type BoardsNavigationContextType = {
  boards: Board[];
  boardsLoading: boolean;
  setBoards: Dispatch<SetStateAction<Board[]>>;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  selectedBoardsIds: string[];
  selectedBoards: Board[];
  selectedBoardRights: Record<RightRole, boolean> | null;
  setSelectedBoardsIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  setSelectedBoardRights: React.Dispatch<Record<RightRole, boolean> | null>;
  toggleSelect: (resource: Board) => void;
};
