import React, { useEffect, useState } from "react";
import "./TreeViewContent.scss";

import { TreeView, useOdeClient } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";

import { useGetFolderTypeData } from "./utils";
import { FOLDER_TYPE, MAIN_PAGE_TITLE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { UserRights } from "~/services/utils/share.utils";

type TreeViewContainerProps = {
  folderType: FOLDER_TYPE;
  data: any;
  dispatch: any;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: any) => void;
  onDisplayModal: (show: boolean) => void;
  modalData: any;
  onSetModalData: (modalData: any) => void;
};

export const TreeViewContainer: React.FunctionComponent<
  TreeViewContainerProps
> = ({
  folderType,
  data,
  dispatch,
  dragAndDropBoards,
  onDragAndDrop,
  onDisplayModal,
  modalData,
  onSetModalData,
}) => {
  const { t } = useTranslation("magneto");

  const [moveBoardsToFolder] = useMoveBoardsMutation();
  const { user } = useOdeClient();
  const [userRights] = useState<UserRights>(new UserRights(user));
  const {
    folderObject,
    folders,
    handleSelect,
    folderNavigationRefs,
    currentFolder,
  } = useFoldersNavigation();

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DROP_DEPTH", dropDepth: data.dropDepth + 1 });
  };
  const handleDragLeave = (e: React.ChangeEvent<HTMLInputElement>) => {
    removeFolderHighlight(e);

    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: "SET_DROP_DEPTH", dropDepth: data.dropDepth - 1 });
    if (data.dropDepth > 0) return;
    dispatch({ type: "SET_IN_DROP_ZONE", inDropZone: false });
  };

  const removeFolderHighlight = (e: React.ChangeEvent<HTMLInputElement>) => {
    let targetElement: HTMLElement;
    if (e.target.closest("li")?.id) {
      if (
        e.target.closest("li")?.id.split("_")[1] == FOLDER_TYPE.MY_BOARDS ||
        e.target.closest("li")?.id.split("_")[1] == FOLDER_TYPE.PUBLIC_BOARDS ||
        e.target.closest("li")?.id.split("_")[1] == FOLDER_TYPE.DELETED_BOARDS
      ) {
        targetElement =
          e.target.closest(".action-container") ?? new HTMLElement();
      } else {
        targetElement = e.target.closest("li") ?? new HTMLElement();
      }
      targetElement.classList.remove("drag-over");
    }
  };

  const handleDragOver = (e: React.ChangeEvent<HTMLInputElement>) => {
    let targetElement: HTMLElement;
    if (e.target.closest("li")?.id) {
      if (
        e.target.closest("li")?.id.split("_")[1] == FOLDER_TYPE.MY_BOARDS ||
        e.target.closest("li")?.id.split("_")[1] == FOLDER_TYPE.PUBLIC_BOARDS ||
        e.target.closest("li")?.id.split("_")[1] == FOLDER_TYPE.DELETED_BOARDS
      ) {
        targetElement =
          e.target.closest(".action-container") ?? new HTMLElement();
      } else {
        targetElement = e.target.closest("li") ?? new HTMLElement();
      }
      targetElement.classList.add("drag-over");
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      !!e.target.closest("li")?.id &&
      e.target.closest("li")?.id.startsWith("listitem") &&
      !!e.target.closest("li")?.id.split("_")[1]
    ) {
      const targetFolderId = e.target.closest("li")?.id.split("_")[1];
      const targetFolder: Folder = getFolderData(targetFolderId ?? "");
      const dragAndDropBoard: Board = dragAndDropBoards[0] ?? new Board();
      const dragAndDropBoardsIds: string[] = dragAndDropBoards.map(
        (board: Board) => board._id,
      );
      const dragAndDropInitialFolder = !dragAndDropBoard.folderId
        ? new Folder().build({
            _id: FOLDER_TYPE.MY_BOARDS,
            ownerId: user?.userId,
            title: MAIN_PAGE_TITLE,
            parentId: "",
          })
        : folders.find(
            (folder: Folder) => folder.id == dragAndDropBoard.folderId,
          ) ?? new Folder();

      if (
        (!dragAndDropBoards[0] && isOwnerOfSelectedBoards()) ||
        targetFolderId == FOLDER_TYPE.PUBLIC_BOARDS ||
        targetFolderId == FOLDER_TYPE.DELETED_BOARDS ||
        !!targetFolder.deleted
      ) {
        //not board owner
        handleNoRightsDragAndDrop();
        return;
      } else if (
        (userRights.folderOwnerNotShared(dragAndDropInitialFolder) ||
          userRights.folderOwnerAndSharedOrShareRights(
            dragAndDropInitialFolder,
          )) &&
        userRights.folderOwnerAndSharedOrShareRights(targetFolder)
      ) {
        //initial folder owner + not shared or has right + shared, target folder has right + shared
        confirmSharedFolderDragAndDrop(
          dragAndDropBoardsIds,
          targetFolder,
          "magneto.folder.share.drag.in.warning",
          targetFolder.title,
        );
      } else if (
        userRights.folderOwnerAndSharedOrShareRights(
          dragAndDropInitialFolder,
        ) &&
        userRights.folderOwnerNotShared(targetFolder)
      ) {
        //initial folder has right + shared, target folder owner + not shared
        confirmSharedFolderDragAndDrop(
          dragAndDropBoardsIds,
          targetFolder,
          "magneto.folder.share.drag.out.warning",
          dragAndDropInitialFolder.title,
        );
      } else if (
        userRights.folderOwnerNotShared(dragAndDropInitialFolder) &&
        userRights.folderOwnerNotShared(targetFolder)
      ) {
        //initial folder owner + not shared, target folder owner + not shared
        proceedOnDragAndDrop(dragAndDropBoards, targetFolder);
      } else {
        handleNoRightsDragAndDrop();
      }

      onDragAndDrop(undefined);
      removeFolderHighlight(e);
    }
    e.stopPropagation();
  };

  const getFolderData = (folderId: string): Folder => {
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
  };

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

  const isOwnerOfSelectedBoards = (): boolean => {
    return dragAndDropBoards.every(
      (board: Board) =>
        !!board && !!board.owner && board.owner.userId === user?.userId,
    );
  };

  const closeDragAndDropModal = (): void => {
    onDisplayModal(false);
    resetDragAndDrop();
  };

  const resetDragAndDrop = (): void => {
    onDragAndDrop(undefined);
  };

  useEffect(() => {
    onSetModalData(modalData);
  }, [modalData]);

  const datas = useGetFolderTypeData(folderType, folderObject);

  useEffect(() => {
    const ref = folderNavigationRefs[folderType];
    if (ref.current && currentFolder.id) {
      ref.current.select(currentFolder.id);
    }
  }, [currentFolder, folderType, folderNavigationRefs]);

  return (
    <>
      <div
        className={"drag-drop-zone"}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <TreeView
          ref={folderNavigationRefs[folderType]}
          data={datas}
          onTreeItemBlur={() => {}}
          onTreeItemFocus={() => {}}
          onTreeItemFold={() => {}}
          onTreeItemSelect={(item) => {
            handleSelect(item, folderType);
          }}
          onTreeItemUnfold={() => {}}
        />
      </div>
    </>
  );
};
