import { t } from "i18next";

import { FolderObjectState, TriggerFetchState } from "./types";
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

export const initialTriggerFetch: TriggerFetchState = {
  myFolders: false,
  deletedFolders: false,
};

//prepareFolders non utilisé pour l'instant
export const prepareFolders = (
  folderId: string,
  folders: Folder[],
  folderTitle: string,
): Folder => {
  switch (
    folderId //TODO : gérer la nouvelle variable folderTitle pour les composants qui vont appeler prepareFolders (ou transformer le utils en hook), sinon le useTranslation n'a pas le droit d'être utilisé
  ) {
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
