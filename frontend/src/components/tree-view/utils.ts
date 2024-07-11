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

// fonctions de fold et unfold, elles seront utilisées quand on aura des retours de edifice

// const onTreeItemUnFold = (itemId: string) => {
//   setSelectedNodeIds((prevSelectedNodeIds) => {
//     const prevLastNodeId = prevSelectedNodeIds.slice(-1)[0];
//     const lastNodeId = itemId === prevLastNodeId ? "" : prevLastNodeId;
//     const filteredNodeIds = prevSelectedNodeIds
//       .slice(0, -1)
//       .filter((id) => id !== itemId);
//     return [...filteredNodeIds, itemId, lastNodeId];
//   });
// };

// const onTreeItemfold = (itemId: string) => {
//   setSelectedNodeIds((prevSelectedNodeIds) => {
//     const filteredNodeIds = prevSelectedNodeIds.filter(
//       (id, index) =>
//         id !== itemId || index === prevSelectedNodeIds.length - 1,
//     );
//     return filteredNodeIds;
//   });
// };
