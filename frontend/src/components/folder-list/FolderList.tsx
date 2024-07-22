import React from "react";

import { animated, useSpring } from "@react-spring/web";

import "./FolderList.scss";
import { FolderItem } from "../folder-item/FolderItem";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";

type FolderListProps = {
  dragAndDropBoards: Board[];
  onDragAndDrop: (board: Board) => void;
  onSetShowModal: (show: boolean) => void;
  modalProps: any;
  onSetModalProps: (modalProps: any) => void;
  searchText: string;
};

export const FolderList: React.FunctionComponent<FolderListProps> = ({
  dragAndDropBoards,
  onDragAndDrop,
  onSetShowModal,
  modalProps,
  onSetModalProps,
  searchText,
}) => {
  const { folders, toggleSelect, selectedFolders } = useFoldersNavigation();

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

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
                    toggleSelect={() => {
                      toggleSelect(folder);
                    }}
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
