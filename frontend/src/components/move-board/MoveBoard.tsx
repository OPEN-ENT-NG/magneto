import React, { FunctionComponent, useCallback, useState } from "react";

// eslint-disable-next-line
import { Button, Modal, TreeView, useOdeClient } from "@edifice-ui/react";

import { useTranslation } from "react-i18next";

import { useGetFolderTypeData } from "../tree-view/utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { UserRights } from "~/utils/share.utils";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";

type props = {
  isOpen: boolean;
  toggle: () => void;
  reset: () => void;
  onDisplayModal: (show: boolean) => void;
  modalData: any;
  onSetModalData: (modalData: any) => void;
};

export const MoveBoard: FunctionComponent<props> = ({
  isOpen,
  toggle,
  reset,
  onDisplayModal,
  modalData,
  onSetModalData,
}: props) => {
  const { t } = useTranslation("magneto");
  const { user } = useOdeClient();
  const [userRights] = useState<UserRights>(new UserRights(user));
  const [moveBoards] = useMoveBoardsMutation();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const { currentFolder, folders, folderObject, folderNavigationRefs } =
    useFoldersNavigation();
  const { selectedBoards, selectedBoardsIds } = useBoardsNavigation();

  const dataTree = {
    children: [],
    id: FOLDER_TYPE.MY_BOARDS,
    name: t("magneto.my.boards"),
    section: true,
    isPublic: false,
  };

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(false);

  let myFolders: Folder[] = [];
  let myFoldersObject: FolderTreeNavItem | undefined = undefined;

  if (!getFoldersError && !getFoldersLoading) {
    myFolders = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); //convert folders to Folder[]

    myFoldersObject = new FolderTreeNavItem({
      id: FOLDER_TYPE.MY_BOARDS,
      title: t("magneto.my.boards"),
      parentId: "",
      section: true,
    }).buildFolders(myFolders);
  }

  const moveBoardsCall = (
    dragAndDropBoardsIds: string[],
    dragAndDropTargetId: string,
  ): void => {
    moveBoards({
      boardIds: dragAndDropBoardsIds,
      folderId: dragAndDropTargetId,
    }).catch((e) => {
      console.log(e);
    });
  };

  const closeMoveRightsModal = (): void => {
    onDisplayModal(false);
  };

  const proceedOnMove = async (
    targetFolder: Folder,
  ) => {
    const targetFolderId: string = targetFolder.id;

    moveBoards({
      boardIds: selectedBoardsIds,
      folderId: targetFolderId,
    }).catch((e) => {
      console.log(e);
    });
  };

  const handleNoMoveRights = (): void => {
    onSetModalData({
      ...modalData,
      i18nKey: "magneto.folder.drag.drop.right.error",
      onCancel: () => closeMoveRightsModal(),
      hasSubmit: false,
    });
    toggle();
    onDisplayModal(true);
  };

  const confirmSharedFolderMove = (
    targetFolder: Folder,
    i18nKey: string,
    param: string,
  ) => {
    onSetModalData({
      ...modalData,
      i18nKey: i18nKey,
      param: param,
      hasSubmit: true,
      onSubmit: () => {
        closeMoveRightsModal();
        moveBoardsCall(selectedBoardsIds, targetFolder.id);
      },
      onCancel: () => closeMoveRightsModal(),
    });
    toggle();
    onDisplayModal(true);
  };

  const isOwnerOfSelectedBoards = (): boolean => {
    return (
      selectedBoards.filter((board: Board) => board?.owner?.userId === user?.userId)
        .length == selectedBoards.length
    );
  };

  const handleMoveRights = () => {
    if (!!selectedBoards.length) {
      const destinationFolder =
        folders.find((folder: Folder) => folder.id == selectedFolderId) ??
        new Folder();

      if (
        (!!selectedBoards[0] && !isOwnerOfSelectedBoards()) ||
        destinationFolder.id == FOLDER_TYPE.PUBLIC_BOARDS ||
        destinationFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
        !!destinationFolder.deleted
      ) {
        //not board owner
        handleNoMoveRights();
      } else if (
        (userRights.folderOwnerNotShared(currentFolder) ||
          userRights.folderOwnerAndSharedOrShareRights(currentFolder)) &&
        userRights.folderOwnerAndSharedOrShareRights(destinationFolder)
      ) {
        //initial folder owner + not shared or has right + shared, target folder has right + shared
        confirmSharedFolderMove(
          destinationFolder,
          "magneto.folder.share.drag.in.warning",
          destinationFolder.title,
        );
      } else if (
        userRights.folderOwnerAndSharedOrShareRights(currentFolder) &&
        userRights.folderOwnerNotShared(destinationFolder)
      ) {
        //initial folder has right + shared, target folder owner + not shared
        confirmSharedFolderMove(
          destinationFolder,
          "magneto.folder.share.drag.out.warning",
          currentFolder.title,
        );
      } else if (
        userRights.folderOwnerNotShared(currentFolder) &&
        userRights.folderOwnerNotShared(destinationFolder) &&
        isOwnerOfSelectedBoards()
      ) {
        //initial folder owner + not shared, target folder owner + not shared + selected boards are ours
        proceedOnMove(destinationFolder);
        toggle();
      } else {
        handleNoMoveRights();
      }

      reset();
    }
  };

  const onSubmit = (): void => {
    handleMoveRights();
  };

  const datas = useGetFolderTypeData(FOLDER_TYPE.MY_BOARDS, folderObject);

  return (
    <>
      {isOpen && (
        <Modal
          id={"create"}
          isOpen={isOpen}
          onModalClose={toggle}
          size="md"
          viewport={false}
        >
          <Modal.Header onModalClose={toggle}>
            <h2>{t("magneto.board.move")}</h2>
          </Modal.Header>
          <Modal.Body>
            {myFoldersObject && (
              <TreeView
                ref={folderNavigationRefs[FOLDER_TYPE.MY_BOARDS]}
                data={datas || dataTree}
                onTreeItemSelect={(item) => {
                  setSelectedFolderId(item);
                }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="right">
              <Button
                color="tertiary"
                type="button"
                variant="ghost"
                className="footer-button"
                onClick={toggle}
              >
                {t("magneto.cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                variant="filled"
                className="footer-button"
                disabled={selectedFolderId === ""}
                onClick={onSubmit}
              >
                {t("magneto.save")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};
