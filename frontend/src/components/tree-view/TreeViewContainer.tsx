import React from "react";
import "./TreeViewContent.scss";

import { TreeView, useOdeClient } from "@edifice-ui/react";
import { t } from "i18next";

import { FOLDER_TYPE, MAIN_PAGE_TITLE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { Board } from "~/models/board.model";
import { useMoveBoardsToFolderMutation } from "~/services/api/boards.service";
import { userInfo } from "os";
import { folderOwnerAndSharedOrShareRights, folderOwnerNotShared } from "~/services/utils/share.utils";

type TreeViewContainerProps = {
  folders: Folder[];
  folderObject: FolderTreeNavItem;
  folderType: string;
  onSelect: (folder: Folder) => void;
  data: any;
  dispatch: any;
  dragAndDropBoard: Board;
  onDragAndDrop: (board: any) => void;
};

export const TreeViewContainer: React.FunctionComponent<
  TreeViewContainerProps
> = ({ folders, folderObject, folderType, onSelect, data, dispatch, dragAndDropBoard, onDragAndDrop}) => {
  const dataTree = {
    children: [],
    id: folderType,
    name: folderType,
    section: true,
  };

  const [moveBoardsToFolder] = useMoveBoardsToFolderMutation();
  const { user } = useOdeClient();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'SET_DROP_DEPTH', dropDepth: data.dropDepth + 1 });
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'SET_DROP_DEPTH', dropDepth: data.dropDepth - 1 });
    if (data.dropDepth > 0) return
    dispatch({ type: 'SET_IN_DROP_ZONE', inDropZone: false })
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!!e.target.closest("li")?.id && e.target.closest("li")?.id.startsWith('listitem')) {
      let targetFolderId = e.target.closest("li")?.id.split('_')[1];
      console.log(targetFolderId);

      let targetFolder = targetFolderId == FOLDER_TYPE.MY_BOARDS ? new Folder().build({_id: FOLDER_TYPE.MY_BOARDS, ownerId: user.userId, title: MAIN_PAGE_TITLE, parentId: ""})
      : folders.find((folder: Folder) => folder.id == dragAndDropBoard.folderId);

      let dragAndDropInitialFolder = !!dragAndDropBoard.folderId ? folders.find((folder: Folder) => folder.id == dragAndDropBoard.folderId)
      : new Folder().build({_id: FOLDER_TYPE.MY_BOARDS, ownerId: user.userId, title: MAIN_PAGE_TITLE, parentId: ""});

      if (dragAndDropBoard.owner.userId != user.userId) { //not board owner
        handleNoRightsDragAndDrop(dragAndDropBoard, targetFolder);
        return ;
    } else if ((folderOwnerNotShared(dragAndDropInitialFolder) || folderOwnerAndSharedOrShareRights(dragAndDropInitialFolder))
            && folderOwnerAndSharedOrShareRights(targetFolder)) {
        //initial folder owner + not shared or has right + shared, target folder has right + shared
        // dragAndDropBoard = dragAndDropBoard;
        // dragAndDropTarget = targetFolder;
        // displayEnterSharedFolderWarningLightbox = true;
    } else if (folderOwnerAndSharedOrShareRights(dragAndDropInitialFolder)
        && folderOwnerNotShared(targetFolder)) {
        //initial folder has right + shared, target folder owner + not shared
        // dragAndDropBoard = dragAndDropBoard;
        // dragAndDropTarget = targetFolder;
        // displayExitSharedFolderWarningLightbox = true;
    } else if (folderOwnerNotShared(dragAndDropInitialFolder) && folderOwnerNotShared(targetFolder)) {
        //initial folder owner + not shared, target folder owner + not shared
        await proceedOnDragAndDrop(dragAndDropBoard, targetFolder);
    } else {
        handleNoRightsDragAndDrop(that, dragAndDropBoard, targetFolder);
    }




      //check folder rights (method)
      //get folder
      //check if is public boards or deleted 
      //check rights
      

      

      onDragAndDrop(undefined);
    } 
    e.preventDefault();
    e.stopPropagation();
  };

  const proceedOnDragAndDrop = async (dragAndDropBoard: Board, dragAndDropTarget: Folder) {




    moveBoardsToFolder({boardId: dragAndDropBoard.id, folderId: targetFolderId})
    .catch((e)=> {console.log(e);});
  }

  const handleNoRightsDragAndDrop =  (dragAndDropBoard: Board, dragAndDropTarget) {

  }  
 

  const selectFolder = (folderId: string) => {
    let clickedFolder;
    if (folderId == FOLDER_TYPE.MY_BOARDS) {
      clickedFolder = new Folder().build({
        _id: folderId,
        title: t("magneto.my.boards"),
      } as IFolderResponse);
    } else if (folderId == FOLDER_TYPE.PUBLIC_BOARDS) {
      clickedFolder = new Folder().build({
        _id: folderId,
        title: t("magneto.lycee.connecte.boards"),
        isPublic: true,
      } as IFolderResponse);
    } else if (folderId == FOLDER_TYPE.DELETED_BOARDS) {
      clickedFolder = new Folder().build({
        _id: folderId,
        title: t("magneto.trash"),
        deleted: true,
      } as IFolderResponse);
    } else {
      clickedFolder =
        folders.find((folder: Folder) => folder.id == folderId) ?? new Folder();
    }
    onSelect(clickedFolder);
  };


  return (
    <>
    <div className={'drag-drop-zone'}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
      <TreeView
        data={folderObject ?? dataTree}
        onTreeItemBlur={() => {
          console.log("blur");
        }}
        onTreeItemFocus={() => {
          console.log("focus");
        }}
        onTreeItemFold={() => {
          console.log("fold");
        }}
        onTreeItemSelect={(item) => {
          selectFolder(item);
        }}
        onTreeItemUnfold={() => {
          console.log("unfold");
        }}
      />
    </div>
    </>
  );
};
