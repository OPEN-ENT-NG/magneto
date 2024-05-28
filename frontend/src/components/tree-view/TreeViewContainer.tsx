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
  folderObject,
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
    const clickedFolder: Folder = folders.find((folder: Folder) => folder.id == folderId)?? new Folder();
    console.log("clickedFolder", clickedFolder);
    onSelect(clickedFolder);
  }

  return (
    <>
      <TreeView
        data={folderObject ?? dataTree}
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
          selectFolder(item);
          console.log("clicked", item);
        }}
        onTreeItemUnfold={() => {
          console.log("unfold");
        }}
      />
    </>
  );
};
