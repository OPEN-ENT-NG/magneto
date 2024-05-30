import React from "react";
import "./TreeViewContent.scss";

import { TreeView } from "@edifice-ui/react";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { t } from "i18next";

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
    let clickedFolder: Folder;
    if (folderId == FOLDER_TYPE.MY_BOARDS) {
      clickedFolder = new Folder().build(({_id: folderId, title: t("magneto.my.boards")} as IFolderResponse));
    } else if (folderId == FOLDER_TYPE.PUBLIC_BOARDS) {
      clickedFolder = new Folder().build(({_id: folderId, title: t("magneto.lycee.connecte.boards"), isPublic: true,} as IFolderResponse));
    } else if (folderId == FOLDER_TYPE.DELETED_BOARDS) {
      clickedFolder = new Folder().build(({_id: folderId, title: t("magneto.trash"), deleted: true,} as IFolderResponse));
    } else {
      clickedFolder = folders.find((folder: Folder) => folder.id == folderId)?? new Folder();
    }
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
        }}
        onTreeItemUnfold={() => {
          console.log("unfold");
        }}
      />
    </>
  );
};
