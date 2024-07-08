import React, { Children } from "react";
import "./TreeViewContent.scss";

import { TreeView } from "@edifice-ui/react";
import { t } from "i18next";

import { getFolderTypeData } from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";

type TreeViewContainerProps = {
  folderType: FOLDER_TYPE;
  onSelect: (folder: Folder) => void;
};

export const TreeViewContainer: React.FunctionComponent<
  TreeViewContainerProps
> = ({ folderType, onSelect }) => {
  const { folderObject, folders, selectedNodeIds, setSelectedNodeIds } = useFoldersNavigation();
  const dataTree={
    children: [{title:"a",children:["a","b"]},"b"],
    id: FOLDER_TYPE.PUBLIC_BOARDS,
    name: t("magneto.lycee.connecte.boards"),
    section: true,
    isPublic: true,
  }

  const selectFolder = (folderId: string): void => {
    let clickedFolder: Folder;
    if (folderId == FOLDER_TYPE.MY_BOARDS) {
      clickedFolder = new Folder().build({
        _id: folderId,
        title: t("magneto.my.boards"),
      } as IFolderResponse);
    } else if (folderId == FOLDER_TYPE.PUBLIC_BOARDS) {
      clickedFolder = new Folder().build({
        _id: folderId,
        title: t("magneto.lycee.connecte.boards"),
        isPublic: true,
      } as IFolderResponse);
    } else if (folderId == FOLDER_TYPE.DELETED_BOARDS) {
      clickedFolder = new Folder().build({
        _id: folderId,
        title: t("magneto.trash"),
        deleted: true,
      } as IFolderResponse);
    } else {
      clickedFolder =
        folders.find((folder: Folder) => folder.id == folderId) ?? new Folder();
    }
    onSelect(clickedFolder);
  };

  const onTreeItemUnFold = (itemId: string) => {

    setSelectedNodeIds((prevSelectedNodeIds) => {
      const prevLastNodeId = prevSelectedNodeIds.slice(-1)[0];
      const lastNodeId = itemId === prevLastNodeId ? "" : prevLastNodeId
      const filteredNodeIds = prevSelectedNodeIds.slice(0, -1).filter(id => id !== itemId);
      return [...filteredNodeIds, itemId, lastNodeId];
    });
  };

  const onTreeItemfold = (itemId: string) => {
    setSelectedNodeIds((prevSelectedNodeIds) => {
      const filteredNodeIds = prevSelectedNodeIds.filter((id, index) => id !== itemId || index === prevSelectedNodeIds.length - 1);
      return filteredNodeIds;
    });
  };

  const data = getFolderTypeData(folderType, folderObject);

  return (
    <>
      <TreeView
        selectedNodesIds={selectedNodeIds}
        data={data || dataTree}
        onTreeItemBlur={() => {
          console.log("blur");
        }}
        onTreeItemFocus={() => {
          console.log("focus");
        }}
        onTreeItemFold={(item) => {
          onTreeItemfold(item);
        }}
        onTreeItemSelect={(item) => {
          selectFolder(item);
        }}
        onTreeItemUnfold={(item) => {
          onTreeItemUnFold(item);
        }}
      />
    </>
  );
};
