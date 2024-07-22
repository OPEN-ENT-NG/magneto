import { useState } from "react";

import {
  Button,
  ActionBar,
  isActionAvailable,
  useToggle,
  useOdeClient,
} from "@edifice-ui/react";
import { useTransition, animated } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import { BoardPublicShareModal } from "../board-public-share-modal/BoardPublicShareModal";
import { CreateFolder } from "../create-folder/CreateFolder";
import { DeleteModal } from "../delete-modal/DeleteModal";
import { MoveBoard } from "../move-board/MoveBoard";
import { ShareModalMagneto } from "../share-modal/ShareModalMagneto";
import { CreateBoard } from "~/components/create-board/CreateBoard";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { RESOURCE_BIG_TYPE } from "~/core/enums/resource-big-type.enum";
import { useRestoreBoardsAndFolders } from "~/hooks/useRestoreBoardsAndFolders";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";
import { useDuplicateBoardMutation } from "~/services/api/boards.service";
import { useActions } from "~/services/queries";
import { useUserRightsStore } from "~/stores";
import { checkUserRight } from "~/utils/checkUserRight";

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
  const [shareOptions, setShareOptions] = useState();
  const { folders, currentFolder, selectedFolders, selectedFoldersIds } =
    useFoldersNavigation();
  const { boards, selectedBoardsIds, selectedBoards } = useBoardsNavigation();
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

  const isMyBoards = () => {
    return (
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      folders.some(
        (folder: Folder) => folder.id === currentFolder.id && !folder.deleted,
      )
    );
  };

  const isTrash = () => {
    return (
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      folders.some(
        (folder: Folder) => folder.id === currentFolder.id && folder.deleted,
      )
    );
  };

  const isPublic = () => {
    return currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS;
  };

  const allBoardsMine = () => {
    if (boards == null) {
      return false;
    }
    return (
      boards.filter((board: Board) => {
        if (board.owner.userId != userId) return board;
      }).length == 0
    );
  };

  const allFoldersMine = () => {
    if (selectedFolders == null) {
      return false;
    }
    return (
      selectedFolders.filter((folder: Folder) => {
        if (folder.ownerId != userId) return folder;
      }).length == 0
    );
  };

  const hasSharedElement = () => {
    return !boards.every((board: Board) => board.rights.length <= 1);
  };

  const hasDuplicationRight = () => {
    const oneBoardSelectedOnly: boolean =
      selectedBoardsIds.length == 1 && selectedFoldersIds.length == 0;
    const isOwnedOrPublicOrShared: boolean =
      allBoardsMine() ||
      boards[0].isPublished; /*|| boards[0].myRights.contrib*/
    return oneBoardSelectedOnly && isOwnedOrPublicOrShared;
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
      allFoldersMine();
    return oneOwnBoardSelectedOnly || oneOwnFolderSelectedOnly;
  };

  const hasRenameRight = () => {
    const isMyBoardsAndOneFolderSelectedOnly: boolean =
      isMyBoards() &&
      selectedFoldersIds.length == 1 &&
      selectedBoardsIds.length == 0;
    const isFolderOwnerOrSharedWithRights: boolean =
      allBoardsMine() || folderHasShareRight(folders[0], "manager");

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
    if (selectedBoardsIds.length > 0) {
      const userRights = await checkUserRight(boards[0].rights);
      const { setUserRights } = useUserRightsStore.getState();
      setUserRights(userRights);
      setShareOptions({
        resourceCreatorId: userId,
        resourceId: selectedBoardsIds[0],
        resourceRights: [boards[0].rights],
      } as any);
      toggleShareBoard();
    } else if (selectedFoldersIds.length > 0) {
      setShareOptions({
        resourceCreatorId: userId,
        resourceId: selectedFoldersIds[0],
        resourceRights: [selectedFolders[0].rights],
      } as any);
      toggleShareFolder();
    }
  };

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
                {!isTrash() &&
                  selectedBoardsIds.length + selectedFoldersIds.length == 1 && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={function Ga() {}}
                    >
                      {t("magneto.open")}
                    </Button>
                  )}
                {isMyBoards() &&
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
                      duplicateBoard(selectedBoardsIds[0]);
                      reset();
                    }}
                  >
                    {t("magneto.duplicate")}
                  </Button>
                )}
                {isMyBoards() &&
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
                {hasShareRight() && (
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
                  !boards[0].isPublished && (
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
                  boards[0].isPublished && (
                    <Button
                      type="button"
                      color="primary"
                      variant="filled"
                      onClick={toggleBoardPublicShareModal}
                    >
                      {t("magneto.public.unshare")}
                    </Button>
                  )}
                {isTrash() && (
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
                {!isPublic() &&
                  ((allBoardsMine() && boards.length > 0) ||
                    (allFoldersMine() && folders.length > 0)) && (
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
      {boards != null && (
        <>
          <CreateBoard
            isOpen={isCreateOpen}
            toggle={toggleCreate}
            boardToUpdate={boards[0]}
            reset={reset}
          />
          <MoveBoard
            isOpen={isMoveOpen}
            toggle={toggleMove}
            boards={boards}
            reset={reset}
          />
          <DeleteModal
            isOpen={isMoveDelete}
            toggle={toggleDelete}
            isPredelete={currentFolder.id != FOLDER_TYPE.DELETED_BOARDS}
            reset={reset}
            hasSharedElement={hasSharedElement}
          />
          <ShareModalMagneto
            isOpen={isShareBoard}
            toggle={toggleShareBoard}
            shareOptions={shareOptions}
            resourceType={RESOURCE_BIG_TYPE.BOARD}
          />
          <BoardPublicShareModal
            isOpen={boardPublicShareModal}
            toggle={toggleBoardPublicShareModal}
            board={boards[0]}
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
          <ShareModalMagneto
            isOpen={isShareFolder}
            toggle={toggleShareFolder}
            shareOptions={shareOptions}
            resourceType={RESOURCE_BIG_TYPE.FOLDER}
          />
        </>
      )}
    </>
  );
};

export default ToasterContainer;
