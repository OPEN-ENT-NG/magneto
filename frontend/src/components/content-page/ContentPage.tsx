import React from "react";

import {  Button, SearchBar, TreeView } from "@edifice-ui/react";
import { Icon } from '@mdi/react';
import { mdiFolderPlus, mdiStar } from '@mdi/js';
import { useTranslation } from "react-i18next";
import { SideBarButtons } from "./SideBarButtons";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { useGetFoldersQuery } from "../../services/api/folders.service";
import { Folder, IFolderResponse } from "../../models/folder.model";
import { FolderTreeNavItem, IFolderTreeNavItem } from "~/models/folder-tree.model";
import { FolderList } from "../folder-list/FolderList";



  export const ContentPage = () => {
  const { t } = useTranslation();

  const { data: myFoldersResult, isLoading: getFoldersLoading, error: getFoldersError } = useGetFoldersQuery(false);
  const { data: deletedFoldersResult, isLoading: getDeletedFoldersLoading, error: getDeletedFoldersError } = useGetFoldersQuery(true);

  let myFolders;
  let deletedFolders;
  

  if (getFoldersError || getDeletedFoldersError) {
    console.log("error");
  } else if (getFoldersLoading || getDeletedFoldersLoading) {
    console.log("loading");
  } else {
    myFolders = myFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Folder[]
    deletedFolders = deletedFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder)));

    // folderNavTrees[0].isOpened = false;
    // folderNavTrees[0].iconClass = "magneto.my.boards";
    // publicFolderNavTrees[0].isOpened = false;
    // publicFolderNavTrees[0].iconClass = "magneto.lycee.connecte.boards";
    // deletedFolderNavTrees[0].isOpened = false;
    // deletedFolderNavTrees[0].iconClass = "magneto.trash";
  }



  return (
    <>
          <SearchBar
            isVariant
            onChange={function Ga(){}}
            onClick={function Ga(){}}
            placeholder="Search something...."
            size="md"
          />
          <FolderList folderData={myFolders} />
          {/* <BoardList /> */}

    </>
  );
};
