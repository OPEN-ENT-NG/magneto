import { useState } from "react";

import {
  Button,
  ActionBar,
  isActionAvailable,
  useToggle,
  useOdeClient,
  checkUserRight,
} from "@edifice-ui/react";
import { useTransition, animated } from "@react-spring/web";
import { ShareOptions } from "node_modules/@edifice-ui/react/dist/common/ShareModal/ShareModal";
import { useTranslation } from "react-i18next";

import { BoardPublicShareModal } from "../board-public-share-modal/BoardPublicShareModal";
import { CreateFolder } from "../create-folder/CreateFolder";
import { DeleteModal } from "../delete-modal/DeleteModal";
import { MoveBoard } from "../move-board/MoveBoard";
import { ShareModalMagneto } from "../share-modal/ShareModalMagneto";
import { CreateBoard } from "~/components/create-board/CreateBoard";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { RESOURCE_BIG_TYPE } from "~/core/enums/resource-big-type.enum";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { useRestoreBoardsAndFolders } from "~/hooks/useRestoreBoardsAndFolders";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { useDuplicateBoardMutation } from "~/services/api/boards.service";
import { useActions } from "~/services/queries";
import { useUserRightsStore } from "~/stores";

export interface ToasterContainerProps {
  reset: () => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
}

export const ToasterContainer = ({
  reset,
  onSetShowModal,
  modalProps,
  onSetModalProps,
}: ToasterContainerProps) => {
  const { t } = useTranslation("magneto");
  const { data: actions } = useActions();
  const canPublish = isActionAvailable("publish", actions);

  const [isCreateOpen, toggleCreate] = useToggle(false);
  const [isMoveOpen, toggleMove] = useToggle(false);
  const [isMoveDelete, toggleDelete] = useToggle(false);
  const [isCreateFolder, toggleCreateFolder] = useToggle(false);
  const [isShareFolder, toggleShareFolder] = useToggle(false);
  const [isShareBoard, toggleShareBoard] = useToggle(false);
  const [boardPublicShareModal, toggleBoardPublicShareModal] = useToggle(false);
  const [shareOptions, setShareOptions] = useState<ShareOptions | null>(null);
  const {
    folderData,
    currentFolder,
    selectedFolders,
    selectedFoldersIds,
    selectedFolderRights,
    handleSelect,
  } = useFoldersNavigation();
  const { selectedBoardsIds, selectedBoards, selectedBoardRights } =
    useBoardsNavigation();
  const { setUserRights } = useUserRightsStore.getState();
  const [duplicateBoard] = useDuplicateBoardMutation();

  const restoreBoardsAndFolders = useRestoreBoardsAndFolders({
    selectedBoardsIds,
    selectedFoldersIds,
  });
  const isToasterOpen = selectedBoards.length > 0 || selectedFolders.length > 0;
  const transition = useTransition(isToasterOpen, {
    from: { opacity: 0, transform: "translateY(100%)" },
    enter: { opacity: 1, transform: "translateY(0)" },
    leave: { opacity: 0, transform: "translateY(100%)" },
  });

  const { user } = useOdeClient();

  const userId = user ? user?.userId : "";

  const isMyBoards = () => {
    return (
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      folderData.some(
        (folder: Folder) => folder.id === currentFolder.id && !folder.deleted,
      )
    );
  };

  const allBoardsMine = () => {
    return (
      selectedBoards !== null &&
      selectedBoards.every((board) => board.owner.userId === userId)
    );
  };
  const areFoldersMine = () => {
    return (
      selectedBoards !== null &&
      selectedFolders.every((folder) => folder.ownerId === userId)
    );
  };
  const isTrash =
    currentFolder.id === FOLDER_TYPE.DELETED_BOARDS ||
    (selectedBoards.every((board) => board.deleted) &&
      selectedFolders.every((folder) => folder.deleted));
  const isPublic = currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS;
  const hasSharedElement = !selectedBoards.every(
    (board: Board) => board.rights.length <= 1,
  );

  const hasDuplicationRight = () => {
    if (selectedBoardsIds.length != 1 || selectedFoldersIds.length != 0)
      return false;
    return (
      selectedBoards[0].owner.userId === userId ||
      selectedBoards[0].isPublished ||
      (selectedBoardRights != null && selectedBoardRights.contrib)
    );
  };

  const hasShareRight = () => {
    const oneOwnBoardSelectedOnly: boolean =
      isMyBoards() &&
      selectedBoardsIds.length == 1 &&
      selectedFoldersIds.length == 0 &&
      allBoardsMine();
    const oneOwnFolderSelectedOnly: boolean =
      selectedFoldersIds.length == 1 &&
      selectedBoardsIds.length == 0 &&
      areFoldersMine();
    return oneOwnBoardSelectedOnly || oneOwnFolderSelectedOnly;
  };

  const hasRenameRight = () => {
    const isMyBoardsAndOneFolderSelectedOnly: boolean =
      isMyBoards() &&
      selectedFoldersIds.length == 1 &&
      selectedBoardsIds.length == 0;
    const isFolderOwnerOrSharedWithRights: boolean =
      areFoldersMine() ||
      (selectedFolderRights != null && selectedFolderRights.manager);

    return (
      isMyBoardsAndOneFolderSelectedOnly && isFolderOwnerOrSharedWithRights
    );
  };

  const openShareModal = async () => {
    try {
      const userRights = await (selectedBoardsIds.length
        ? checkUserRight(selectedBoards[0].rights)
        : checkUserRight(selectedFolders[0].rights));
      setUserRights(userRights);

      if (selectedBoardsIds.length > 0) {
        setShareOptions({
          resourceCreatorId: userId,
          resourceId: selectedBoardsIds[0],
          resourceRights: selectedBoards[0].rights as string[],
        });
        toggleShareBoard();
      } else if (selectedFoldersIds.length > 0) {
        setShareOptions({
          resourceCreatorId: userId,
          resourceId: selectedFoldersIds[0],
          resourceRights: selectedFolders[0].rights as string[],
        });
        toggleShareFolder();
      }
    } catch (error) {
      console.error("Error checking user rights:", error);
    }
  };
  const duplicateBoardsAndToast = usePredefinedToasts({
    func: duplicateBoard,
    parameter: selectedBoardsIds[0],
    successMessage: t("magneto.duplicate.elements.confirm"),
    failureMessage: t("magneto.duplicate.elements.error"),
  });

  return (
    <>
      {transition((style, isToasterOpen) => {
        return (
          isToasterOpen && (
            <animated.div
              className="position-fixed bottom-0 start-0 end-0 z-3"
              style={style}
            >
              <ActionBar>
                {!isTrash &&
                  selectedBoardsIds.length + selectedFoldersIds.length == 1 && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={() => {
                        selectedBoardsIds.length == 1 //if we selected a board, open it (TODO), else open the folder
                          ? undefined
                          : handleSelect(
                              selectedFoldersIds[0],
                              FOLDER_TYPE.MY_BOARDS, //the button being there only if not in trash, and no folders being in "Public boards", the folder has to be in "My boards"
                            );
                      }}
                    >
                      {t("magneto.open")}
                    </Button>
                  )}
                {isMyBoards() &&
                  selectedBoardsIds.length == 1 &&
                  selectedFoldersIds.length == 0 &&
                  selectedBoardRights != null &&
                  selectedBoardRights.manager && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={toggleCreate}
                    >
                      {t("magneto.properties")}
                    </Button>
                  )}
                {hasDuplicationRight() && (
                  <Button
                    type="button"
                    color="primary"
                    variant="filled"
                    onClick={() => {
                      duplicateBoardsAndToast();
                      reset();
                    }}
                  >
                    {t("magneto.duplicate")}
                  </Button>
                )}
                {isMyBoards() &&
                  !isTrash &&
                  selectedBoardsIds.length > 0 &&
                  selectedFoldersIds.length == 0 &&
                  allBoardsMine() && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={toggleMove}
                    >
                      {t("magneto.move")}
                    </Button>
                  )}
                {hasRenameRight() && (
                  <Button
                    type="button"
                    color="primary"
                    variant="filled"
                    onClick={toggleCreateFolder}
                  >
                    {t("magneto.rename")}
                  </Button>
                )}
                {hasShareRight() && !isTrash && (
                  <Button
                    type="button"
                    color="primary"
                    variant="filled"
                    onClick={openShareModal}
                  >
                    {t("magneto.share")}
                  </Button>
                )}
                {!(currentFolder.rights.length > 1) &&
                  isMyBoards() &&
                  selectedBoardsIds.length == 1 &&
                  selectedFoldersIds.length == 0 &&
                  allBoardsMine() &&
                  canPublish &&
                  !isTrash &&
                  !selectedBoards[0].isPublished && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={toggleBoardPublicShareModal}
                    >
                      {t("magneto.public.share")}
                    </Button>
                  )}
                {isMyBoards() &&
                  selectedBoardsIds.length == 1 &&
                  selectedFoldersIds.length == 0 &&
                  allBoardsMine() &&
                  canPublish &&
                  selectedBoards[0].isPublished && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={toggleBoardPublicShareModal}
                    >
                      {t("magneto.public.unshare")}
                    </Button>
                  )}
                {isTrash && (
                  <Button
                    type="button"
                    color="primary"
                    variant="filled"
                    onClick={() => {
                      restoreBoardsAndFolders();
                      reset();
                    }}
                  >
                    {t("magneto.restore")}
                  </Button>
                )}
                {!isPublic && allBoardsMine() && areFoldersMine() && (
                  <Button
                    type="button"
                    color="primary"
                    variant="filled"
                    onClick={toggleDelete}
                  >
                    {t("magneto.delete")}
                  </Button>
                )}
              </ActionBar>
            </animated.div>
          )
        );
      })}
      {selectedBoards != null && (
        <>
          <CreateBoard
            isOpen={isCreateOpen}
            toggle={toggleCreate}
            boardToUpdate={selectedBoards[0]}
            reset={reset}
          />
          <MoveBoard
            isOpen={isMoveOpen}
            toggle={toggleMove}
            reset={reset}
            onDisplayModal={onSetShowModal}
            modalData={modalProps}
            onSetModalData={onSetModalProps}
          />
          <DeleteModal
            isOpen={isMoveDelete}
            toggle={toggleDelete}
            isPredelete={!isTrash}
            reset={reset}
            hasSharedElement={hasSharedElement}
          />
          {shareOptions && (
            <ShareModalMagneto
              isOpen={isShareBoard}
              toggle={toggleShareBoard}
              shareOptions={shareOptions}
              resourceType={RESOURCE_BIG_TYPE.BOARD}
            />
          )}
          <BoardPublicShareModal
            isOpen={boardPublicShareModal}
            toggle={toggleBoardPublicShareModal}
            board={selectedBoards[0]}
            reset={reset}
          />
        </>
      )}
      {selectedFolders != null && (
        <>
          <CreateFolder
            isOpen={isCreateFolder}
            toggle={toggleCreateFolder}
            folderToUpdate={selectedFolders[0]}
            reset={reset}
          />
          {shareOptions && (
            <ShareModalMagneto
              isOpen={isShareFolder}
              toggle={toggleShareFolder}
              shareOptions={shareOptions}
              resourceType={RESOURCE_BIG_TYPE.FOLDER}
            />
          )}
        </>
      )}
    </>
  );
};

export default ToasterContainer;
