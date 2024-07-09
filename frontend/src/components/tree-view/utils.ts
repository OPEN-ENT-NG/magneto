import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderObjectState } from "~/providers/FoldersNavigationProvider/types";

export const getFolderTypeData = (
  folderType: FOLDER_TYPE,
  folderObject: FolderObjectState,
) => {
  switch (folderType) {
    case FOLDER_TYPE.MY_BOARDS:
      return folderObject.myFolderObject;
    case FOLDER_TYPE.PUBLIC_BOARDS:
      return null;
    case FOLDER_TYPE.DELETED_BOARDS:
      return folderObject.deletedFolderObject;
    default:
      return folderObject.myFolderObject;
  }
};
