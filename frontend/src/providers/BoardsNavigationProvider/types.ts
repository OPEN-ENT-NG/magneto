import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import { TreeViewHandlers } from "@edifice-ui/react";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Board } from "~/models/board.model";

export interface BoardsNavigationProviderProps {
  children: ReactNode;
}

export interface BoardObjectState {
  myBoardObject: FolderTreeNavItem | null;
  deletedBoardObject: FolderTreeNavItem | null;
}

export interface TriggerFetchState {
  myBoards: boolean;
  myAllBoards: boolean;
}
export interface BoardNavigationRefs {
  [FOLDER_TYPE.MY_BOARDS]: RefObject<TreeViewHandlers>;
  [FOLDER_TYPE.PUBLIC_BOARDS]: RefObject<TreeViewHandlers>;
  [FOLDER_TYPE.DELETED_BOARDS]: RefObject<TreeViewHandlers>;
}

export type BoardsNavigationContextType = {
  currentBoard: Board;
  setCurrentBoard: Dispatch<SetStateAction<Board>>;
  boardData: Board[];
  setBoardData: Dispatch<SetStateAction<Board[]>>;
  boardObject: BoardObjectState;
  setBoardObject: Dispatch<SetStateAction<BoardObjectState>>;
  boards: Board[];
  setBoards: Dispatch<SetStateAction<Board[]>>;
  getBoards: () => void;
  handleSelect: (
    boardId: string,
    boardType: FOLDER_TYPE | "basicBoard",
  ) => void;
  boardNavigationRefs: BoardNavigationRefs;
};

