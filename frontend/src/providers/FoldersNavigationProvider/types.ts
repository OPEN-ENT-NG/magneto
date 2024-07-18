import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import { TreeViewHandlers } from "@edifice-ui/react";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder } from "~/models/folder.model";

export interface FoldersNavigationProviderProps {
  children: ReactNode;
}

export interface FolderObjectState {
  myFolderObject: FolderTreeNavItem | null;
  deletedFolderObject: FolderTreeNavItem | null;
}

export interface FolderNavigationRefs {
  [FOLDER_TYPE.MY_BOARDS]: RefObject<TreeViewHandlers>;
  [FOLDER_TYPE.PUBLIC_BOARDS]: RefObject<TreeViewHandlers>;
  [FOLDER_TYPE.DELETED_BOARDS]: RefObject<TreeViewHandlers>;
}

export type FoldersNavigationContextType = {
  currentFolder: Folder;
  setCurrentFolder: Dispatch<SetStateAction<Folder>>;
  folderData: Folder[];
  setFolderData: Dispatch<SetStateAction<Folder[]>>;
  folderObject: FolderObjectState;
  setFolderObject: Dispatch<SetStateAction<FolderObjectState>>;
  folders: Folder[];
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  handleSelect: (
    folderId: string,
    folderType: FOLDER_TYPE | "basicFolder",
  ) => void;
  folderNavigationRefs: FolderNavigationRefs;
};
