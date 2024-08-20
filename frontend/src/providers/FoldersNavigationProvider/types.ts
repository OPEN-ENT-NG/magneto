import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";

import { TreeViewHandlers } from "@edifice-ui/react";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder } from "~/models/folder.model";
import { RightRole } from "edifice-ts-client";

export type BasicFolder = "basicFolder";

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
  folders: Folder[];
  setFolders: Dispatch<SetStateAction<Folder[]>>;
  setFolderObject: Dispatch<SetStateAction<FolderObjectState>>;
  selectedFoldersIds: string[];
  setSelectedFoldersIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedFolders: Folder[];
  setSelectedFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  selectedNodesIds: string[];
  setSelectedNodesIds: React.Dispatch<React.SetStateAction<string[]>>;
  selectedFolderRights: Record<RightRole, boolean> | null;
  setSelectedFolderRights: React.Dispatch<Record<RightRole, boolean> | null>;
  handleSelect: (
    folderId: string,
    folderType: FOLDER_TYPE | BasicFolder,
  ) => void;
  toggleSelect: (resource: Folder) => void;
  folderNavigationRefs: FolderNavigationRefs;
  handleFolderRefs: (
    folderId: string,
    folderType: FOLDER_TYPE | BasicFolder,
    folderData: Folder[],
    folderNavigationRefs: FolderNavigationRefs,
  ) => void;
};
