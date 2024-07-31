import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderObjectState } from "~/providers/FoldersNavigationProvider/types";
import { useInitialPublicFolderObject } from "~/providers/FoldersNavigationProvider/useInitialPublicFolderObject";

export const useGetFolderTypeData = (
  folderType: FOLDER_TYPE,
  folderObject: FolderObjectState,
) => {
  const publicFolderObject = useInitialPublicFolderObject();
  if (folderObject.myFolderObject && folderObject.deletedFolderObject) {
    switch (folderType) {
      case FOLDER_TYPE.MY_BOARDS:
        return folderObject.myFolderObject;
      case FOLDER_TYPE.PUBLIC_BOARDS:
        return publicFolderObject;
      case FOLDER_TYPE.DELETED_BOARDS:
        return folderObject.deletedFolderObject;
      default:
        return folderObject.myFolderObject;
    }
  }
  return publicFolderObject;
};
