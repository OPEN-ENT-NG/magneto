import React, { useCallback, useEffect, useState } from "react";

import { Card, useOdeClient } from "@edifice-ui/react";
import "./FolderItem.scss";
import { mdiFolder, mdiFolderAccount } from "@mdi/js";
import Icon from "@mdi/react";
import { useDrop } from "react-dnd";

import { DRAG_AND_DROP_TYPE } from "~/core/enums/drag-and-drop-type.enum";
import { FOLDER_TYPE, MAIN_PAGE_TITLE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { UserRights } from "~/utils/share.utils";

type FolderListProps = {
  isSelected: boolean;
  folder: Folder;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: any) => void;
  onDisplayModal: (show: boolean) => void;
  modalData: any;
  onSetModalData: (modalData: any) => void;
};

export const FolderItem: React.FunctionComponent<FolderListProps> = ({
  isSelected,
  folder,
  dragAndDropBoards,
  onDragAndDrop,
  onDisplayModal,
  modalData,
  onSetModalData,
}) => {
  const { currentApp, user } = useOdeClient();
  const [moveBoardsToFolder] = useMoveBoardsMutation();
  const [userRights] = useState<UserRights>(new UserRights(user));
  const [hasDrop, setHasDrop] = useState<boolean>(false);
  const { folderData, handleSelect, toggleSelect } = useFoldersNavigation();

  const folderTitle = folder.title;

  const [{ isOver }, drop] = useDrop({
    accept: "board",
    drop: () => setHasDrop(true),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const dragAndDropBoardsCall = useCallback(
    (dragAndDropBoardsIds: string[], dragAndDropTargetId: string): void => {
      moveBoardsToFolder({
        boardIds: dragAndDropBoardsIds,
        folderId: dragAndDropTargetId,
      }).catch((e) => {
        console.log(e);
      });
    },
    [moveBoardsToFolder],
  );

  const resetDragAndDrop = useCallback((): void => {
    onDragAndDrop(undefined);
  }, [onDragAndDrop]);

  const closeDragAndDropModal = useCallback((): void => {
    onDisplayModal(false);
    resetDragAndDrop();
  }, [onDisplayModal, resetDragAndDrop]);

  const proceedOnDragAndDrop = useCallback(
    async (dragAndDropBoards: Board[], dragAndDropTarget: Folder) => {
      const dragAndDropTargetId: string = dragAndDropTarget.id;
      const dragAndDropBoardsIds: string[] = dragAndDropBoards.map(
        (board: Board) => board._id,
      );

      resetDragAndDrop();
      dragAndDropBoardsCall(dragAndDropBoardsIds, dragAndDropTargetId);
    },
    [dragAndDropBoardsCall, resetDragAndDrop],
  );

  const handleNoRightsDragAndDrop = useCallback((): void => {
    onSetModalData({
      ...modalData,
      i18nKey: "magneto.folder.drag.drop.right.error",
      onCancel: () => closeDragAndDropModal(),
      hasSubmit: false,
    });
    onDisplayModal(true);
  }, [closeDragAndDropModal, modalData, onDisplayModal, onSetModalData]);

  const confirmSharedFolderDragAndDrop = useCallback(
    (
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
        onSubmit: () => {
          closeDragAndDropModal();
          dragAndDropBoardsCall(dragAndDropBoardsIds, dragAndDropTarget.id);
        },
        onCancel: () => closeDragAndDropModal(),
      });
      onDisplayModal(true);
    },
    [
      closeDragAndDropModal,
      dragAndDropBoardsCall,
      modalData,
      onDisplayModal,
      onSetModalData,
    ],
  );

  const isOwnerOfSelectedBoards = useCallback(
    (boards: Board[]): boolean => {
      return boards.every(
        (board: Board) =>
          !!board &&
          !!board.owner &&
          board.owner.userId === (user?.userId ?? ""),
      );
    },
    [user?.userId],
  );

  const handleDragAndDropRights = useCallback(() => {
    const boards = dragAndDropBoards;
    if (hasDrop && !!boards.length) {
      const dragAndDropBoardsIds: string[] = boards.map(
        (board: Board) => board._id,
      );
      const dragAndDropInitialFolder = !boards[0].folderId
        ? new Folder().build({
            _id: FOLDER_TYPE.MY_BOARDS,
            ownerId: user?.userId ?? "",
            title: MAIN_PAGE_TITLE,
            parentId: "",
          })
        : folderData.find(
            (folder: Folder) => folder.id == boards[0].folderId,
          ) ?? new Folder();

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
        userRights.folderOwnerNotShared(folder) &&
        isOwnerOfSelectedBoards(boards)
      ) {
        //initial folder owner + not shared, target folder owner + not shared + selected boards are ours
        proceedOnDragAndDrop(boards, folder);
      } else {
        handleNoRightsDragAndDrop();
      }

      onDragAndDrop(undefined);
      setHasDrop(false);
    }
  }, [
    confirmSharedFolderDragAndDrop,
    dragAndDropBoards,
    folder,
    folderData,
    handleNoRightsDragAndDrop,
    hasDrop,
    isOwnerOfSelectedBoards,
    onDragAndDrop,
    proceedOnDragAndDrop,
    user?.userId,
    userRights,
  ]);

  useEffect(() => {
    handleDragAndDropRights();
  }, [hasDrop, handleDragAndDropRights]);

  return (
    <>
      <div
        ref={drop}
        draggable="true"
        className={
          isOver
            ? DRAG_AND_DROP_TYPE.DRAG_OVER
            : DRAG_AND_DROP_TYPE.NO_DRAG_OVER
        }
      >
        <Card
          app={currentApp!}
          isSelected={isSelected}
          options={{
            type: "folder",
            folderTitle,
          }}
          isLoading={false}
          isSelectable={true}
          onClick={() => {
            handleSelect(folder.id, "basicFolder");
          }}
          onSelect={() => toggleSelect(folder)}
        >
          <Card.Body>
            {!folder.shared.length ? (
              <Icon path={mdiFolder} size={2} color={"#3BA6CF"} />
            ) : (
              <Icon path={mdiFolderAccount} size={2} color={"#3BA6CF"} />
            )}
            <Card.Title className="folder-title">{folder.title}</Card.Title>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};
