import React, { FunctionComponent, useState } from "react";

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
  const { t } = useTranslation("magneto");
  const [moveBoards] = useMoveBoardsMutation();
  const [selectedFolderId, setSelectedFolderId] = useState<string>("");
  const { folderObject, folderNavigationRefs } = useFoldersNavigation();

  const { user } = useOdeClient();

  const userId = user ? user?.userId : "";

  const isSameAsUser = (id: string) => {
    return id == userId;
  };

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
      folderId: selectedFolderId,
    });
    reset();
    toggle();
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
