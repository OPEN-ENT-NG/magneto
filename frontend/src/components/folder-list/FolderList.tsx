import React, { useEffect, useState } from "react";

import { animated, useSpring } from "@react-spring/web";

import "./FolderList.scss";
import { FolderItem } from "../folder-item/FolderItem";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";

type FolderListProps = {
  currentFolder: Folder;
  onSelect: (folder: Folder) => void;
  folderIds: string[];
  selectedFolders: Folder[];
  setFolderIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: Board) => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
  searchText: string;
};

export const FolderList: React.FunctionComponent<FolderListProps> = ({
  currentFolder,
  onSelect,
  dragAndDropBoards,
  onDragAndDrop,
  onSetShowModal,
  modalProps,
  onSetModalProps,
  searchText,
}) => {
  const [foldersQuery, setFoldersQuery] = useState<boolean>(false);

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(foldersQuery);

  let folderData: Folder[] = [];

  const filterFolderData = (): void => {
    if (
      !currentFolder.id ||
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      currentFolder.id == ""
    ) {
      folderData = folderData.filter((folder: Folder) => !folder.parentId);
    } else if (currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS) {
      folderData = [];
    } else if (!!currentFolder && !!currentFolder.id) {
      folderData = folderData.filter(
        (folder: Folder) => folder.parentId == currentFolder.id,
      );
    } else {
      console.log("currentFolder undefined, try later or again");
    }
  };

  if (getFoldersError) {
    console.log("error");
  } else if (getFoldersLoading) {
    console.log("loading");
  } else if (myFoldersResult) {
    folderData = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); // convert folders to Folder[]
    filterFolderData();
  }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
    setFoldersQuery(
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS || !!currentFolder.deleted,
    );
  }, [currentFolder]);

  return (
    <>
      {folderData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {folderData
            .filter((folder: Folder) => {
              if (searchText === "") {
                return folder;
              } else if (
                folder.title.toLowerCase().includes(searchText.toLowerCase())
              ) {
                return folder;
              }
            })
            .map((folder: Folder) => {
              const { id } = folder;
              return (
                <animated.li
                  className="g-col-4 z-1 folderSizing"
                  key={id}
                  style={{
                    position: "relative",
                    ...springs,
                  }}
                >
                  <FolderItem
                    folder={folder}
                    folders={folderData}
                    areFoldersLoading={getFoldersLoading}
                    onSelect={onSelect}
                    dragAndDropBoards={dragAndDropBoards}
                    onDragAndDrop={onDragAndDrop}
                    onDisplayModal={onSetShowModal}
                    modalData={modalProps}
                    onSetModalData={onSetModalProps}
                  />
                </animated.li>
              );
            })}
        </animated.ul>
      ) : null}
    </>
  );
};
