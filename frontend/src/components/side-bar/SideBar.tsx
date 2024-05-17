import React from "react";

import {  Button, TreeView } from "@edifice-ui/react";
import { Icon } from '@mdi/react';
import { mdiFolderPlus, mdiStar } from '@mdi/js';
import { useTranslation } from "react-i18next";
import { SideBarButtons } from "./SideBarButtons";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { useGetFoldersQuery } from "../../services/api/folders.service";
import { Folder, IFolderResponse } from "../../models/folder.model";
import { FolderTreeNavItem, IFolderTreeNavItem } from "~/models/folder-tree.model";



  export const SideBar = () => {
  const { t } = useTranslation();

  const { data: myFoldersResult, isLoading: getFoldersLoading, error: getFoldersError } = useGetFoldersQuery(false);
  const { data: deletedFoldersResult, isLoading: getDeletedFoldersLoading, error: getDeletedFoldersError } = useGetFoldersQuery(true);

  let myFoldersObject;
  let deletedFoldersObject;
  

  if (getFoldersError || getDeletedFoldersError) {
    console.log("error");
  } else if (getFoldersLoading || getDeletedFoldersLoading) {
    console.log("loading");
  } else {
    let myFolders = myFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder))); //convert folders to Folder[]
    let deletedFolders = deletedFoldersResult.map(((folder: IFolderResponse) => new Folder().build(folder)));
    
    myFoldersObject =new FolderTreeNavItem({
        id: FOLDER_TYPE.MY_BOARDS, title: t('magneto.my.boards'), 
        parentId: '', section: true
    }, false, "magneto-check-decagram").buildFolders(myFolders);
    deletedFoldersObject = new FolderTreeNavItem({
            id: FOLDER_TYPE.DELETED_BOARDS, title: t('magneto.trash'),
            parentId: '', section: true
        }, false, "magneto.trash").buildFolders(deletedFolders);
  }



  return (
    <>
        <aside className="g-col-3 g-col-lg-2 g-col-xl-3 border-end pt-16 pe-16 d-none d-lg-block">
          <TreeViewContainer folders={myFoldersObject} folderType={FOLDER_TYPE.MY_BOARDS} />
          <TreeViewContainer folders={{children: [], id: FOLDER_TYPE.PUBLIC_BOARDS, name: t("magneto.lycee.connecte.boards"), section: true}} folderType={FOLDER_TYPE.MY_BOARDS} />
          <TreeViewContainer folders={deletedFoldersObject} folderType={FOLDER_TYPE.DELETED_BOARDS}/>
          <SideBarButtons />
        </aside>
    </>
  );
};
