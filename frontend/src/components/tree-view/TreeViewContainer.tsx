import React from "react";
import "./TreeViewContent.scss";

import { TreeView } from "@edifice-ui/react";
import { t } from "i18next";

import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { Board } from "~/models/board.model";
import { useMoveBoardsToFolderMutation } from "~/services/api/boards.service";

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
    if (!!e.target.closest("li")?.id) {
      let droppedFolderId = e.target.closest("li")?.id.split('_')[1];
      console.log(droppedFolderId);

      moveBoardsToFolder({boardId: dragAndDropBoard.id, folderId: droppedFolderId});

      onDragAndDrop(undefined);
    } 
    e.preventDefault();
    e.stopPropagation();
  };

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
