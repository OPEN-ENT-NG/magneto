import React, { FunctionComponent, useState } from "react";

// eslint-disable-next-line
import { Button, Modal, useOdeClient } from "@edifice-ui/react";

import { t } from "i18next";

import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useMoveBoardsMutation } from "~/services/api/boards.service";
import { useGetFoldersQuery } from "~/services/api/folders.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
  boards: Board[];
  reset: () => void;
};

export const MoveBoard: FunctionComponent<props> = ({
  isOpen,
  toggle,
  boards,
  reset,
}: props) => {
  const [moveBoards] = useMoveBoardsMutation();
  const [currentFolder, setCurrentFolder] = useState<Folder>(new Folder());

  const { user } = useOdeClient();

  const userId = user ? user?.userId : "";

  const isSameAsUser = (id: string) => {
    return id == userId;
  };

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(false);

  let myFolders: Folder[] = [];
  let myFoldersObject: FolderTreeNavItem | undefined = undefined;

  if (getFoldersError) {
    console.log("error");
  } else if (getFoldersLoading) {
    console.log("loading");
  } else {
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

  const onSubmit = (): void => {
    const boardIds: string[] = boards
      .filter((board) => {
        return isSameAsUser(board.owner.userId);
      })
      .map((myBoard) => {
        return myBoard.id;
      });
    moveBoards({
      boardIds: boardIds,
      folderId: currentFolder.id,
    });
    reset();
    toggle();
  };

  return (
    <>
      {isOpen && (
        <Modal
          id={"create"}
          isOpen={isOpen}
          onModalClose={toggle}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={toggle}>
            <h2>{t("magneto.board.move")}</h2>
          </Modal.Header>
          <Modal.Body>
            {myFoldersObject && (
              <TreeViewContainer
                folders={myFolders ?? []}
                folderObject={myFoldersObject ?? undefined}
                folderType={FOLDER_TYPE.MY_BOARDS}
                onSelect={setCurrentFolder}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <div className="right">
              <Button
                color="primary"
                type="button"
                variant="outline"
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
