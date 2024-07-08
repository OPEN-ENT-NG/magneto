import { Dispatch, ReactNode, SetStateAction } from "react";

import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder } from "~/models/folder.model";

export interface FoldersNavigationProviderProps {
  children: ReactNode;
}

export interface FolderObjectState {
  myFolderObject: FolderTreeNavItem | null;
  deletedFolderObject: FolderTreeNavItem | null;
}

export interface TriggerFetchState {
  myFolders: boolean;
  deletedFolders: boolean;
}

export type FoldersNavigationContextType = {
  currentFolder: Folder;
  setCurrentFolder: Dispatch<SetStateAction<Folder>>;
  selectedNodeIds: string[];
  setSelectedNodeIds: Dispatch<SetStateAction<string[]>>;
  folders: Folder[];
  folderObject: FolderObjectState;
  getFolders: () => void;
};
