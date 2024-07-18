import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import { TreeViewHandlers } from "@edifice-ui/react";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Board } from "~/models/board.model";

export interface BoardsNavigationProviderProps {
  children: ReactNode;
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
  boards: Board[];
  setBoards: Dispatch<SetStateAction<Board[]>>;
};

