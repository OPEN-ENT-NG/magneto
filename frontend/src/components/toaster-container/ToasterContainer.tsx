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
}
export const ToasterContainer = ({ reset }: ToasterContainerProps) => {
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
  const { folders, currentFolder, selectedFolders, selectedFoldersIds } =
    useFoldersNavigation();
  const { selectedBoardsIds, selectedBoards } = useBoardsNavigation();
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

  const isSameAsUser = (id: string) => {
    return id == userId;
  };

  const isMyBoards = selectedBoards.every((board) => board.owner.userId === userId);
  const isMyFolders = selectedFolders.every((folder) => folder.ownerId === userId);
  const isTrash = currentFolder.id === FOLDER_TYPE.DELETED_BOARDS || (selectedBoards.every((board) => board.deleted) && selectedFolders.every((folder) => folder.deleted));
  const isPublic = currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS;
  const hasSharedElement = !selectedBoards.every((board: Board) => board.rights.length <= 1);


  const hasDuplicationRight = () => {
    const oneBoardSelectedOnly: boolean =
      selectedBoardsIds.length == 1 && selectedFoldersIds.length == 0;
    const isOwnedOrPublicOrShared: boolean =
      isMyBoards ||
      selectedBoards[0].isPublished; /*|| boards[0].myRights.contrib*/
    return oneBoardSelectedOnly && isOwnedOrPublicOrShared;
  };

  const hasShareRight = () => {
    const oneOwnBoardSelectedOnly: boolean =
      isMyBoards &&
      selectedBoardsIds.length == 1 &&
      selectedFoldersIds.length == 0 &&
      isMyBoards;
    const oneOwnFolderSelectedOnly: boolean =
      selectedFoldersIds.length == 1 &&
      selectedBoardsIds.length == 0 &&
      isMyFolders;
    return oneOwnBoardSelectedOnly || oneOwnFolderSelectedOnly;
  };

  const hasRenameRight = () => {
    const isMyBoardsAndOneFolderSelectedOnly: boolean =
      isMyBoards &&
      selectedFoldersIds.length == 1 &&
      selectedBoardsIds.length == 0;
    const isFolderOwnerOrSharedWithRights: boolean =
      isMyBoards || folderHasShareRight(folders[0], "manager");

    return (
      isMyBoardsAndOneFolderSelectedOnly && isFolderOwnerOrSharedWithRights
    );
  };

  const folderHasShareRight = (folder: Folder, right: string) => {
    const shareRight: string = right;
    if (!folder || !folder.shared) return false;

    folder.shared.forEach((shareItem: any) => {
      const hasIndividualShareRight: boolean =
        !!shareItem.userId &&
        isSameAsUser(shareItem.userId) &&
        shareItem[shareRight] == true;

      const hasGroupShareRight: boolean =
        !!shareItem.groupId &&
        !!user?.groupsIds.find((groupId: string) => {
          shareItem.groupId == groupId && shareItem[shareRight] == true;
        });

      if (hasIndividualShareRight || hasGroupShareRight) return true;
    });

    return false;
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
  console.log({ isTrash, selectedBoards, selectedFolders });

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
                      onClick={function Ga() { }}
                    >
                      {t("magneto.open")}
                    </Button>
                  )}
                {isMyBoards &&
                  !isTrash &&
                  selectedBoardsIds.length == 1 &&
                  selectedFoldersIds.length ==
                  0 /*&& boards[0].myRights.manager*/ && (
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
                {isMyBoards &&
                  !isTrash &&
                  selectedBoardsIds.length > 0 &&
                  selectedFoldersIds.length == 0 &&
                  isMyBoards && (
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
                  isMyBoards &&
                  selectedBoardsIds.length == 1 &&
                  selectedFoldersIds.length == 0 &&
                  isMyBoards &&
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
                {isMyBoards &&
                  selectedBoardsIds.length == 1 &&
                  selectedFoldersIds.length == 0 &&
                  isMyBoards &&
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
                {!isPublic && isMyBoards && isMyFolders && (
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
            boards={selectedBoards}
            reset={reset}
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
