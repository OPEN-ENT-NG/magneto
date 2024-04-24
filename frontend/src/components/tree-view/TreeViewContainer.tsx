import React from "react";
import "./TreeViewContent.scss";

import { Button, TreeView } from "@edifice-ui/react";
import { useSelector } from "react-redux";

// import * as MaterialDesign from "react-icons/md";

interface FolderTreeNavItem {
  id: string;
  name: string;
  iconClass: string;
  children: Array<FolderTreeNavItem>;
  parentId: string;
  isOpened: boolean;
  ownerId: string;
  shared: any[];
}

//export const TreeViewContainer: React.FC<FolderTreeNavItem> = ({ id, name, iconClass, children, parentId, isOpened, ownerId, shared }) => {
export const TreeViewContainer = ({
  folders: folders,
  folderType: folderType,
}) => {
  /**
   * Check if the folder has a children (or sub-children) with the given id
   * @param folderId Folder identifier
   */
  const childrenContainsId = (folderId: string): boolean => {
    return (
      this.id == folderId ||
      this.children.some(
        (folder: FolderTreeNavItem) =>
          folder.id === folderId || folder.childrenContainsId(folderId),
      )
    );
  };

  /**
   * Open all folders from the given children folder to the current folder
   * @param folderId Folder identifier
   */
  const openChildrenToId = (folderId: string): void => {
    if (this.childrenContainsId(folderId)) {
      this._isOpened = true;
      if (this.children) {
        this.children.forEach((folder: FolderTreeNavItem) => {
          folder.openChildrenToId(folderId);
        });
      }
    }
  };

  let treeExample = {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    id: "12",
                    name: "level 4 arborescence tree",
                  },
                  {
                    id: "13",
                    name: "nul james",
                  },
                ],
                id: "8",
                name: "level 3 arborescence tree",
              },
              {
                id: "9",
                name: "level 3 arborescence tree",
              },
            ],
            id: "4",
            name: "level 2 arborescence tree",
          },
          {
            children: [
              {
                id: "10",
                name: "level 3 arborescence tree",
              },
              {
                id: "11",
                name: "level 3 arborescence tree",
              },
            ],
            id: "5",
            name: "level 2 arborescence tree",
          },
        ],
        id: "1",
        name: "level 1 arborescence tree",
      },
      {
        children: [
          {
            id: "6",
            name: "level 2 arborescence tree",
          },
          {
            id: "7",
            name: "level 2 arborescence tree",
          },
        ],
        id: "2",
        name: "level 1 arborescence tree",
      },
      {
        id: "3",
        name: "level 1 arborescence tree",
      },
    ],
    id: "root",
    name: "Section Element",
    section: true,
  };

  let dataTree = {
    children: [],
    id: folderType,
    name: folderType,
    section: true,
  };

  return (
    <>
      <TreeView
        data={folders ?? dataTree}
        onTreeItemBlur={() => {
          console.log("blur");
        }}
        onTreeItemFocus={() => {
          console.log("focus");
        }}
        onTreeItemFold={() => {
          console.log("fold");
        }}
        onTreeItemSelect={() => {
          console.log("clicked");
        }}
        onTreeItemUnfold={() => {
          console.log("unfold");
        }}
      />
    </>
  );
};
