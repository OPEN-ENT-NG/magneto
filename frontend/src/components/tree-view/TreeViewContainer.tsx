import React from "react";
import "./TreeViewContent.scss";

import { TreeView } from "@edifice-ui/react";

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
