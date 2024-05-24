import React from "react";
import "./TreeViewContent.scss";

import { TreeView } from "@edifice-ui/react";
import { Folder } from "~/models/folder.model";
import { FolderTreeNavItem } from "~/models/folder-tree.model";

type TreeViewContainerProps = {
  folders: Folder[],
  folderObject: FolderTreeNavItem,
  folderType: string,
  currentFolder: Folder;
  onSelect: (folder: Folder) => void;
}

export const TreeViewContainer: React.FunctionComponent<TreeViewContainerProps> = ({
  folders,
  folderType,
  currentFolder,
  onSelect
}) => {

  const dataTree = {
    children: [],
    id: folderType,
    name: folderType,
    section: true,
  };

  const selectFolder = (folderId: string): void => {

  }

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
        onTreeItemSelect={(item) => {
          console.log("clicked", item);
        }}
        onTreeItemUnfold={() => {
          console.log("unfold");
        }}
      />
    </>
  );
};
