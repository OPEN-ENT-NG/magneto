import { useTranslation } from "react-i18next";

import { FolderObjectState, TriggerFetchState } from "./types";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "~/models/folder.model";

export const initialCurrentFolder: Folder = new Folder(FOLDER_TYPE.MY_BOARDS);

export const initialFolderObject: FolderObjectState = {
  myFolderObject: null,
  deletedFolderObject: null,
};

export const initialTriggerFetch: TriggerFetchState = {
  myFolders: false,
  deletedFolders: false,
};

//prepareFolders non utilisé pour l'instant
export const prepareFolders = (folderId: string, folders: Folder[]): Folder => {
  const { t } = useTranslation("magneto");
  switch (folderId) {
    case FOLDER_TYPE.MY_BOARDS:
      return new Folder().build({
        _id: folderId,
        title: t("magneto.my.boards"),
      } as IFolderResponse);
    case FOLDER_TYPE.PUBLIC_BOARDS:
      return new Folder().build({
        _id: folderId,
        title: t("magneto.lycee.connecte.boards"),
        isPublic: true,
      } as IFolderResponse);
    case FOLDER_TYPE.DELETED_BOARDS:
      return new Folder().build({
        _id: folderId,
        title: t("magneto.trash"),
        deleted: true,
      } as IFolderResponse);
    default:
      return (
        folders.find((folder: Folder) => folder.id === folderId) ?? new Folder()
      );
  }
};
