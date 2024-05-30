import React from "react";

import { useTranslation } from "react-i18next";

import { SideBarButtons } from "./SideBarButtons";
import { FOLDER_TYPE } from "../../core/enums/folder-type.enum";
import { Folder, IFolderResponse } from "../../models/folder.model";
import { useGetFoldersQuery } from "../../services/api/folders.service";
import { TreeViewContainer } from "../tree-view/TreeViewContainer";
import { FolderTreeNavItem } from "~/models/folder-tree.model";

type SideBarProps = {
  currentFolder: Folder;
  onSelect: (folder: Folder) => void;
}

  export const SideBar: React.FunctionComponent<SideBarProps> = ({ currentFolder, onSelect }) => {
  const { t } = useTranslation();

  const {
    data: myFoldersResult,
    isLoading: getFoldersLoading,
    error: getFoldersError,
  } = useGetFoldersQuery(false);
  const {
    data: deletedFoldersResult,
    isLoading: getDeletedFoldersLoading,
    error: getDeletedFoldersError,
  } = useGetFoldersQuery(true);


  let myFolders: Folder[];
  let deletedFolders: Folder[]
  let myFoldersObject: FolderTreeNavItem;
  let deletedFoldersObject: FolderTreeNavItem;

  if (getFoldersError || getDeletedFoldersError) {
    console.log("error");
  } else if (getFoldersLoading || getDeletedFoldersLoading) {
    console.log("loading");
  } else {
    myFolders = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); //convert folders to Folder[]
    deletedFolders = deletedFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    );

    myFoldersObject = new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.MY_BOARDS,
        title: t("magneto.my.boards"),
        parentId: "",
        section: true,
      },
      false,
      "magneto-check-decagram",
    ).buildFolders(myFolders);
    deletedFoldersObject = new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.DELETED_BOARDS,
        title: t("magneto.trash"),
        parentId: "",
        section: true,
        deleted: true
      },
      false,
      "magneto.trash",
    ).buildFolders(deletedFolders);
  }

  return (
    <>
      <aside className="g-col-3 g-col-lg-2 g-col-xl-3 border-end pt-16 pe-16 d-none d-lg-block">
        <TreeViewContainer
          folders={myFolders ?? []}
          folderObject={myFoldersObject ?? undefined}
          folderType={FOLDER_TYPE.MY_BOARDS}
          onSelect={onSelect}
        />
        <TreeViewContainer
          folders={myFolders ?? []}
          folderObject={{
            children: [],
            id: FOLDER_TYPE.PUBLIC_BOARDS,
            name: t("magneto.lycee.connecte.boards"),
            section: true,
            isPublic: true
          }}
          folderType={FOLDER_TYPE.MY_BOARDS}
          onSelect={onSelect}
          
        />
        <TreeViewContainer
          folders={deletedFolders}
          folderObject={deletedFoldersObject}
          folderType={FOLDER_TYPE.DELETED_BOARDS}
          onSelect={onSelect}
        />
        <SideBarButtons />
      </aside>
    </>
  );
};
