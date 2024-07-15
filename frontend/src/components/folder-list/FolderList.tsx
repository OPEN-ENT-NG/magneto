import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

import { animated, useSpring } from "@react-spring/web";

import "./FolderList.scss";
import { FolderItem } from "../folder-item/FolderItem";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";

type FolderListProps = {
  // folders: Folder[];
  // onSetFolders: Dispatch<SetStateAction<Folder[]>>;
  currentFolder: Folder;
  selectedFolderIds: string[];
  selectedFolders: Folder[];
  setSelectedFolderIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: Board) => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
  searchText: string;
};

export const FolderList: React.FunctionComponent<FolderListProps> = ({
  // folders,
  // onSetFolders,
  currentFolder,
  dragAndDropBoards,
  onDragAndDrop,
  onSetShowModal,
  modalProps,
  onSetModalProps,
  searchText,
  setSelectedFolderIds,
  selectedFolderIds,
  setSelectedFolders,
  selectedFolders,
}) => {
  const [foldersQuery, setFoldersQuery] = useState<boolean>(false);
  const { folders, getFolders, setFolders } = useFoldersNavigation();


  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(foldersQuery);


  const filterFolderData = (folderData: Folder[]): void => {
    if (
      !currentFolder.id ||
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      currentFolder.id == ""
    ) {
      setFolders(folderData.filter((folder: Folder) => !folder.parentId));
      console.log(folderData);
    } else if (currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS) {
      setFolders([]);
    } else if (!!currentFolder && !!currentFolder.id) {
      setFolders(folderData.filter(
        (folder: Folder) => folder.parentId == currentFolder.id
      ));
    } else {
      console.log("currentFolder undefined, try later or again");
    }
  };

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  useEffect(() => {
    setFoldersQuery(
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS || !!currentFolder.deleted,
    );

    let folderData: Folder[];
    if (getFoldersError) {
      console.log("error");
    } else if (getFoldersLoading) {
      console.log("loading");
    } else if (myFoldersResult) {
      folderData = myFoldersResult.map((folder: IFolderResponse) =>
        new Folder().build(folder)); // convert folders to Folder[]
      filterFolderData(folderData);
    }
  }, [currentFolder]);

  const toggleSelect = async (resource: Folder) => {
    if (selectedFolderIds.includes(resource.id)) {
      setSelectedFolderIds(
        selectedFolderIds.filter(
          (selectedResource: String) => selectedResource !== resource.id,
        ),
      );
      setSelectedFolders(
        selectedFolders.filter(
          (selectedResource) => selectedResource.id !== resource.id,
        ),
      );
      return;
    }
    setSelectedFolderIds([...selectedFolderIds, resource.id]);
    setSelectedFolders([...selectedFolders, resource]);
  };

  return (
    <>
      {folders?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {folders
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
                    isSelected={selectedFolders
                      .map((item: Folder) => item.id)
                      .includes(folder.id)}
                    folder={folder}
                    foldersData={folders}
                    areFoldersLoading={getFoldersLoading}
                    toggleSelect={toggleSelect}
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
