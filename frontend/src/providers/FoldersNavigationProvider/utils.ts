import { t } from "i18next";

import { FolderObjectState } from "./types";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "~/models/folder.model";

export const initialCurrentFolder = () => {
  const folder = new Folder(FOLDER_TYPE.MY_BOARDS);
  folder.title = t("magneto.my.boards");
  return folder;
};

export const initialFolderObject: FolderObjectState = {
  myFolderObject: null,
  deletedFolderObject: null,
};

export const prepareFolderTitle = (folderType: FOLDER_TYPE | "basicFolder") => {
  if (folderType === FOLDER_TYPE.MY_BOARDS) return "magneto.my.boards";
  if (folderType === FOLDER_TYPE.PUBLIC_BOARDS)
    return "magneto.lycee.connecte.boards";
  if (folderType === FOLDER_TYPE.DELETED_BOARDS) return "magneto.trash";
  return "basicFolder";
};

export const prepareFolder = (
  folderId: string,
  folders: Folder[],
  folderTitle: string,
): Folder => {
  switch (folderId) {
    case FOLDER_TYPE.MY_BOARDS:
      return new Folder().build({
        _id: folderId,
        title: folderTitle, //t("magneto.my.boards"),
      } as IFolderResponse);
    case FOLDER_TYPE.PUBLIC_BOARDS:
      return new Folder().build({
        _id: folderId,
        title: folderTitle, //t("magneto.lycee.connecte.boards"),
        isPublic: true,
      } as IFolderResponse);
    case FOLDER_TYPE.DELETED_BOARDS:
      return new Folder().build({
        _id: folderId,
        title: folderTitle, //t("magneto.trash"),
        deleted: true,
      } as IFolderResponse);
    default:
      return (
        folders.find((folder: Folder) => folder.id === folderId) ?? new Folder()
      );
  }
};

export const prepareFoldersState = (
  folderData: Folder[],
  currentFolder: Folder
): Folder[] => {
  const isOrphanedRestored = (folder: Folder): boolean => {
    if (folder.deleted || !folder.parentId) {
      return false;
    }
    const parentFolder = folderData.find(f => f.id === folder.parentId);
    return parentFolder ? parentFolder.deleted : false;
  };

  if (currentFolder.id === FOLDER_TYPE.MY_BOARDS) {
    return folderData.filter(folder => !folder.deleted && (!folder.parentId || isOrphanedRestored(folder)));
  } else if (currentFolder.id === FOLDER_TYPE.DELETED_BOARDS) {
    return folderData.filter(folder => 
      folder.deleted && (!folder.parentId || !folderData.find(f => f.id === folder.parentId)?.deleted)
    );
  } else if (currentFolder.id === FOLDER_TYPE.PUBLIC_BOARDS) {
    return [];
  } else {
    return folderData.filter(folder => 
      folder.parentId === currentFolder.id && folder.deleted === currentFolder.deleted
    );
  }
};
