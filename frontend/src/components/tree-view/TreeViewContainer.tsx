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
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: any) => void;
};

export const TreeViewContainer: React.FunctionComponent<
  TreeViewContainerProps
> = ({ folders, folderObject, folderType, onSelect, data, dispatch, dragAndDropBoards, onDragAndDrop}) => {
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
    if (!!e.target.closest("li")?.id && e.target.closest("li")?.id.startsWith('listitem') && !!e.target.closest("li")?.id.split('_')[1]) {
      let targetFolderId = e.target.closest("li")?.id.split('_')[1];
      console.log(targetFolderId);

      let targetFolder: Folder = getFolderData(targetFolderId ?? "");

      let dragAndDropBoard: Board = dragAndDropBoards[0] ?? new Board();  

      let dragAndDropInitialFolder = !dragAndDropBoard.folderId ? new Folder().build({_id: FOLDER_TYPE.MY_BOARDS, ownerId: user.userId, title: MAIN_PAGE_TITLE, parentId: ""})
      : folders.find((folder: Folder) => folder.id == dragAndDropBoard.folderId) ?? new Folder();

      if ((!!dragAndDropBoards[0] && isOwnerOfSelectedBoards()) || targetFolderId == FOLDER_TYPE.PUBLIC_BOARDS) { //not board owner
          handleNoRightsDragAndDrop(dragAndDropBoard, targetFolder);
          return ;
      } else if ((folderOwnerNotShared(dragAndDropInitialFolder) || folderOwnerAndSharedOrShareRights(dragAndDropInitialFolder))
              && folderOwnerAndSharedOrShareRights(targetFolder)) {
          //initial folder owner + not shared or has right + shared, target folder has right + shared
          // dragAndDropBoards = dragAndDropBoards;
          // dragAndDropTarget = targetFolder;
          // displayEnterSharedFolderWarningLightbox = true;
      } else if (folderOwnerAndSharedOrShareRights(dragAndDropInitialFolder)
          && folderOwnerNotShared(targetFolder)) {
          //initial folder has right + shared, target folder owner + not shared
          // dragAndDropBoards = dragAndDropBoards;
          // dragAndDropTarget = targetFolder;
          // displayExitSharedFolderWarningLightbox = true;
      } else if (folderOwnerNotShared(dragAndDropInitialFolder) && folderOwnerNotShared(targetFolder)) {
          //initial folder owner + not shared, target folder owner + not shared
          proceedOnDragAndDrop(dragAndDropBoards, targetFolder);
      } else {
          handleNoRightsDragAndDrop(dragAndDropBoard, targetFolder);
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


  const getFolderData =  (folderId: string): Folder => {
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

    return clickedFolder;
  } 

  const proceedOnDragAndDrop = async (dragAndDropBoards: Board[], dragAndDropTarget: Folder, isFromMoveBoardLightbox?: boolean) => {
    let dragAndDropTargetId: string = dragAndDropTarget.id;
    let dragAndDropBoardsIds: string [] = dragAndDropBoards.map((board: Board) => board._id);

    // submitted from lightbox
    if (isFromMoveBoardLightbox) {
      moveBoardsToFolder({boardIds: dragAndDropBoardsIds, folderId: dragAndDropTargetId})
        .catch((e)=> {console.log(e);});
      resetDragAndDrop();
       onFormSubmit();
      return ;
    }
    resetDragAndDrop();
    let idOriginalItem: string = dragAndDropBoards[0].id;

    // sublitted directly
    if (dragAndDropBoards.length > 0) {
        if (dragAndDropTargetId == FOLDER_TYPE.DELETED_BOARDS) {
            //openDeleteForm();
        } else {
          moveBoardsToFolder({boardIds: dragAndDropBoardsIds, folderId: dragAndDropTargetId})
            .catch((e)=> {console.log(e);});
           onFormSubmit();
        }
    } else {
        // Move one board
        let draggedItemIds: string[] = dragAndDropBoards.filter(board => board.id === idOriginalItem).map(board => board.id);
        if (dragAndDropTarget.id == FOLDER_TYPE.DELETED_BOARDS) {
          dragAndDropBoards = draggedItemIds;
            // openDeleteForm();
        } else {
          moveBoardsToFolder({boardIds: dragAndDropBoards.id, folderId: dragAndDropTargetId})
            .catch((e)=> {console.log(e);});
          onFormSubmit();
        }
    }    
  }

  const handleNoRightsDragAndDrop =  (dragAndDropBoard: Board, dragAndDropTarget: Folder) => {
    //return modale (message, onSubmit, onCancel)
  }  

  const isOwnerOfSelectedBoards = (): boolean => {
    return this.selectedBoards.every((board:Board) => !!board && !!board.owner && board.owner.userId === model.me.userId);
}

  const resetDragAndDrop = (): void => {
    onSelect(new Folder());
    onDragAndDrop(undefined);
  }

  const onFormSubmit = (): void => {
    // update boards
    // update folders ?
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
