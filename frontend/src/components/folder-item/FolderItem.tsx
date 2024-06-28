import React, { useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";

import "./FolderItem.scss";
import { Folder } from "~/models/folder.model";
import { useDrop } from "react-dnd";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { Board } from "~/models/board.model";
import { FOLDER_TYPE, MAIN_PAGE_TITLE } from "~/core/enums/folder-type.enum";
import { UserRights } from "~/services/utils/share.utils";


type FolderListProps = {
    folder: Folder;
    folders: Folder[];
    areFoldersLoading: boolean;
    onSelect: (folder: Folder) => void;
    dragAndDropBoards: Board[];
    onDragAndDrop: (board: any) => void;
};

export const FolderItem: React.FunctionComponent<FolderListProps> = ({
    folder,
    folders,
    areFoldersLoading,
    onSelect,
    dragAndDropBoards,
    onDragAndDrop
}) => {
  const { currentApp } = useOdeClient();
  const [moveBoardsToFolder] = useMoveBoardsMutation();
  const { user } = useOdeClient();
  const [ userRights ] = useState<UserRights>(new UserRights(user));
  const [showModale, setShowModale] = useState(false);
  const [modaleProps, setModaleProps] = useState({isOpen: false,
    i18nKey: "",
    param: "",
    hasSubmit: false,
    onSubmit: () => {},
    onCancel: () => {
      setShowModale(false);
      resetDragAndDrop();
    }});
  const [hasDrop, setHasDrop] = useState<boolean>(false);

  const folderTitle = folder.title;

  const [, drop] = useDrop(
    () => ({
      accept: "board",
      drop: (item: any) => {
        // checkDragAndDropRights(dragAndDropBoards);
        setHasDrop(true);
      }
    }),
  )

  // const checkDragAndDropRights = (boards: Board[]) => {
  useEffect(() => {
    const boards = dragAndDropBoards;
    if (hasDrop && !!boards.length) {
      let dragAndDropBoardsIds: string[] = boards.map((board: Board) => board._id);
      // let boardFolderId = boards[0].folderId ?? boards[0]._folderId;
      let dragAndDropInitialFolder = !boards[0].folderId ? new Folder().build({_id: FOLDER_TYPE.MY_BOARDS, ownerId: user.userId, title: MAIN_PAGE_TITLE, parentId: ""})
      : folders.find((folder: Folder) => folder.id == boards[0].folderId) ?? new Folder();

      if ((!boards[0] && isOwnerOfSelectedBoards(boards)) || folder.id == FOLDER_TYPE.PUBLIC_BOARDS || folder.id == FOLDER_TYPE.DELETED_BOARDS || !!folder.deleted) { //not board owner
          handleNoRightsDragAndDrop();
          return ;
      } else if ((userRights.folderOwnerNotShared(dragAndDropInitialFolder) || userRights.folderOwnerAndSharedOrShareRights(dragAndDropInitialFolder))
              && userRights.folderOwnerAndSharedOrShareRights(folder)) {
          //initial folder owner + not shared or has right + shared, target folder has right + shared
          confirmSharedFolderDragAndDrop(dragAndDropBoardsIds, folder, "magneto.folder.share.drag.in.warning", folder.title)
      } else if (userRights.folderOwnerAndSharedOrShareRights(dragAndDropInitialFolder)
          && userRights.folderOwnerNotShared(folder)) {
          //initial folder has right + shared, target folder owner + not shared
          confirmSharedFolderDragAndDrop(dragAndDropBoardsIds, folder, "magneto.folder.share.drag.out.warning", dragAndDropInitialFolder.title)
      } else if (userRights.folderOwnerNotShared(dragAndDropInitialFolder) && userRights.folderOwnerNotShared(folder)) {
          //initial folder owner + not shared, target folder owner + not shared
          proceedOnDragAndDrop(boards, folder);
      } else {
          handleNoRightsDragAndDrop();
      }

      onDragAndDrop(undefined);
      setHasDrop(false);
    }
  }, [hasDrop]);

  const proceedOnDragAndDrop = async (dragAndDropBoards: Board[], dragAndDropTarget: Folder) => {
    let dragAndDropTargetId: string = dragAndDropTarget.id;
    let dragAndDropBoardsIds: string [] = dragAndDropBoards.map((board: Board) => board._id);

    resetDragAndDrop();
    dragAndDropBoardsCall(dragAndDropBoardsIds, dragAndDropTargetId);
  }


  const handleNoRightsDragAndDrop =  (): void => {
    setModaleProps({...modaleProps, i18nKey: "magneto.folder.drag.drop.right.error"});
    console.log(modaleProps);
    setShowModale(true);
  }

  const confirmSharedFolderDragAndDrop =  (dragAndDropBoardsIds: string[], dragAndDropTarget: Folder, i18nKey: string, param: string) => {
    setModaleProps({...modaleProps, i18nKey: i18nKey, param: param, hasSubmit: true, onSubmit: () => dragAndDropBoardsCall(dragAndDropBoardsIds, dragAndDropTarget.id)});
    console.log(modaleProps);
    setShowModale(true);
  }

  const dragAndDropBoardsCall =  (dragAndDropBoardsIds: string[], dragAndDropTargetId: string): void => {

    moveBoardsToFolder({boardIds: dragAndDropBoardsIds, folderId: dragAndDropTargetId})
        .catch((e)=> {console.log(e);});
  }

  const isOwnerOfSelectedBoards = (boards: Board[]): boolean => {
    return boards.every((board:Board) => !!board && !!board.owner && board.owner.userId === user.userId);
}

  const resetDragAndDrop = (): void => {
    onSelect(new Folder());
    onDragAndDrop(undefined);
  }



  return (
    <>
      <div ref={drop} draggable="true">
        <Card
          app={currentApp!}
          options={{
            type: "folder",
            folderTitle,
          }}
          // onClick={() => {setIsToasterOpen()}}
          isLoading={areFoldersLoading}
          isSelectable={true}
          onClick={() => {
            onSelect(folder);
          }}
        >
          <Card.Body>
            <Icon path={mdiFolderPlus} size={1}></Icon>
            <Card.Title>{folder.title}</Card.Title>
          </Card.Body>
        </Card>
      </div>

              
    </>
  );
};
