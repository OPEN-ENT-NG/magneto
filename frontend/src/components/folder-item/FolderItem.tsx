import React, { useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import { mdiFolderPlus } from "@mdi/js";
import { Icon } from "@mui/material";
import "./FolderItem.scss";
import { useDrop } from "react-dnd";

import { FOLDER_TYPE, MAIN_PAGE_TITLE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { UserRights } from "~/services/utils/share.utils";

type FolderListProps = {
  folder: Folder;
  folders: Folder[];
  areFoldersLoading: boolean;
  onSelect: (folder: Folder) => void;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: any) => void;
  onDisplayModal: (show: boolean) => void;
  modalData: any;
  onSetModalData: (modalData: any) => void;
};

export const FolderItem: React.FunctionComponent<FolderListProps> = ({
  folder,
  folders,
  areFoldersLoading,
  onSelect,
  dragAndDropBoards,
  onDragAndDrop,
  onDisplayModal,
  modalData,
  onSetModalData,
}) => {
  const { currentApp } = useOdeClient();
  const [moveBoardsToFolder] = useMoveBoardsMutation();
  const { user } = useOdeClient();
  const [userRights] = useState<UserRights>(new UserRights(user));

  const [hasDrop, setHasDrop] = useState<boolean>(false);

  const folderTitle = folder.title;

  const [{ isOver }, drop] = useDrop({
    accept: "board",
    drop: () => setHasDrop(true),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  useEffect(() => {
    handleDragAndDropRights();
  }, [hasDrop]);

  function handleDragAndDropRights() {
    const boards = dragAndDropBoards;
    if (hasDrop && !!boards.length) {
      const dragAndDropBoardsIds: string[] = boards.map(
          (board: Board) => board._id,
      );
      const dragAndDropInitialFolder = !boards[0].folderId
          ? new Folder().build({
            _id: FOLDER_TYPE.MY_BOARDS,
            ownerId: user.userId,
            title: MAIN_PAGE_TITLE,
            parentId: "",
          })
          : folders.find((folder: Folder) => folder.id == boards[0].folderId) ??
          new Folder();

      if (
          (!boards[0] && isOwnerOfSelectedBoards(boards)) ||
          folder.id == FOLDER_TYPE.PUBLIC_BOARDS ||
          folder.id == FOLDER_TYPE.DELETED_BOARDS ||
          !!folder.deleted
      ) {
        //not board owner
        handleNoRightsDragAndDrop();
        return;
      } else if (
          (userRights.folderOwnerNotShared(dragAndDropInitialFolder) ||
              userRights.folderOwnerAndSharedOrShareRights(
                  dragAndDropInitialFolder,
              )) &&
          userRights.folderOwnerAndSharedOrShareRights(folder)
      ) {
        //initial folder owner + not shared or has right + shared, target folder has right + shared
        confirmSharedFolderDragAndDrop(
            dragAndDropBoardsIds,
            folder,
            "magneto.folder.share.drag.in.warning",
            folder.title,
        );
      } else if (
          userRights.folderOwnerAndSharedOrShareRights(
              dragAndDropInitialFolder,
          ) &&
          userRights.folderOwnerNotShared(folder)
      ) {
        //initial folder has right + shared, target folder owner + not shared
        confirmSharedFolderDragAndDrop(
            dragAndDropBoardsIds,
            folder,
            "magneto.folder.share.drag.out.warning",
            dragAndDropInitialFolder.title,
        );
      } else if (
          userRights.folderOwnerNotShared(dragAndDropInitialFolder) &&
          userRights.folderOwnerNotShared(folder)
      ) {
        //initial folder owner + not shared, target folder owner + not shared
        proceedOnDragAndDrop(boards, folder);
      } else {
        handleNoRightsDragAndDrop();
      }

      onDragAndDrop(undefined);
      setHasDrop(false);
    }
  }

  const proceedOnDragAndDrop = async (
    dragAndDropBoards: Board[],
    dragAndDropTarget: Folder,
  ) => {
    const dragAndDropTargetId: string = dragAndDropTarget.id;
    const dragAndDropBoardsIds: string[] = dragAndDropBoards.map(
      (board: Board) => board._id,
    );

    resetDragAndDrop();
    dragAndDropBoardsCall(dragAndDropBoardsIds, dragAndDropTargetId);
  };

  const handleNoRightsDragAndDrop = (): void => {
    onSetModalData({
      ...modalData,
      i18nKey: "magneto.folder.drag.drop.right.error",
      onCancel: () => closeDragAndDropModal(),
    });
    onDisplayModal(true);
  };

  const confirmSharedFolderDragAndDrop = (
    dragAndDropBoardsIds: string[],
    dragAndDropTarget: Folder,
    i18nKey: string,
    param: string,
  ) => {
    onSetModalData({
      ...modalData,
      i18nKey: i18nKey,
      param: param,
      hasSubmit: true,
      onSubmit: () =>
        dragAndDropBoardsCall(dragAndDropBoardsIds, dragAndDropTarget.id),
      onCancel: () => closeDragAndDropModal(),
    });
    console.log(modalData);
    onDisplayModal(true);
  };

  const dragAndDropBoardsCall = (
    dragAndDropBoardsIds: string[],
    dragAndDropTargetId: string,
  ): void => {
    moveBoardsToFolder({
      boardIds: dragAndDropBoardsIds,
      folderId: dragAndDropTargetId,
    }).catch((e) => {
      console.log(e);
    });
  };

  const isOwnerOfSelectedBoards = (boards: Board[]): boolean => {
    return boards.every(
      (board: Board) =>
        !!board && !!board.owner && board.owner.userId === user.userId,
    );
  };

  const closeDragAndDropModal = (): void => {
    onDisplayModal(false);
    resetDragAndDrop();
  };

  const resetDragAndDrop = (): void => {
    onSelect(new Folder());
    onDragAndDrop(undefined);
  };

  return (
    <>
      <div ref={drop} draggable="true" className={isOver ? "drag-over" : ""}>
        <Card
          app={currentApp!}
          options={{
            type: "folder",
            folderTitle,
          }}
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
