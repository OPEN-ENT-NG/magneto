import React from "react";
import { useEffect, useState } from "react";

import { TreeView, Grid, Heading, useToggle, Button } from "@edifice-ui/react";
//import { formControlClasses } from "@mui/material";
import { ID } from "edifice-ts-client";

import { Card } from "~/components/card/Card.tsx";
import { CreateFolder } from "~/components/create-folder/CreateFolder";
import { CreateTab } from "~/components/create-tab/createTab";
import Header from "~/components/header/Header";
//import { TreeViewContainer } from "~/components/tree-view/TreeViewContainer";
//import { getBoards } from "~/services/api/boards.service";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { formControlClasses } from "@mui/material";
import {
  FolderTreeNavItem,
  IFolderTreeNavItem,
} from "~/models/folder-tree.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { useTranslation } from "react-i18next";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { TreeViewButtons } from "~/components/tree-view/TreeViewButtons";

// const ExportModal = lazy(async () => await import("~/features/export-modal"));

export interface AppProps {
  _id: string;
  created: Date;
  description: string;
  map: string;
  modified: Date;
  name: string;
  owner: { userId: ID; displayName: string };
  shared: any[];
  thumbnail: string;
}

export const App = () => {
  const [isOpen, toggle] = useToggle(false);
  console.log("i am in app");
  const [isCreateFolderOpen, toggleCreateFolderOpen] = useToggle(false);
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [openedFolder, setOpenedFolder] = useState(null);
  const [displayBoardLightbox, setDisplayBoardLightbox] = useState(false);
  const [displayDeleteBoardLightbox, setDisplayDeleteBoardLightbox] =
    useState(false);
  const [displayFolderLightbox, setDisplayMoveBoardLightbox] = useState(false);
  const [displayMoveBoardLightbox, setDisplayFolderLightbox] = useState(false);
  const [displayCollectionLightbox, setDisplayCollectionLightbox] =
    useState(false);
  const [displayShareBoardLightbox, setDisplayShareBoardLightbox] =
    useState(false);
  const [displayShareFolderLightbox, setDisplayShareFolderLightbox] =
    useState(false);
  const [displayPublicShareBoardLightbox, setDisplayPublicShareBoardLightbox] =
    useState(false);
  const [
    displayEnterSharedFolderWarningLightbox,
    setDisplayEnterSharedFolderWarningLightbox,
  ] = useState(false);
  const [
    displayExitSharedFolderWarningLightbox,
    setDisplayExitSharedFolderWarningLightbox,
  ] = useState(false);
  const [
    displayMoveNoRightInFolderLightbox,
    setDisplayMoveNoRightInFolderLightbox,
  ] = useState(false);
  const [isFromMoveBoardLightbox, setIsFromMoveBoardLightbox] = useState(false);

  //this.magnetoStandalone = this.$window.magnetoStandalone == "true";
  // this.filter = new BoardsFilter();

  const [boards, setBoards] = useState([]);
  const [currentFolderChildren, setCurrentFolderChildren] = useState([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [folderNavTrees, setFolderNavTrees] = useState<FolderTreeNavItem[]>([
    new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.MY_BOARDS,
        title: t("magneto.my.boards"),
        parentId: "",
        section: true,
      },
      false,
      "magneto-check-decagram",
    ),
  ]);
  const [publicFolderNavTrees, setpublicFolderNavTrees] = useState<
    FolderTreeNavItem[]
  >([
    new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.PUBLIC_BOARDS,
        title: t("magneto.lycee.connecte.boards"),
        parentId: "",
        section: true,
      },
      false,
      "magneto-earth",
    ),
  ]);
  const [deletedFolderNavTrees, setdeletedFolderNavTrees] = useState<
    FolderTreeNavItem[]
  >([
    new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.DELETED_BOARDS,
        title: t("magneto.trash"),
        parentId: "",
        section: true,
      },
      false,
      "magneto.trash",
    ),
  ]);
  const [folderMoveNavTrees, setFolderMoveNavTrees] = useState([]);
  // this.selectedUpdateBoardForm = new BoardForm();
  // this.selectedUpdateFolderForm = {id: null, title: ''};
  // this.deletedFolders = await this.getDeletedFolders();

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
  console.log(myFoldersResult);

  let myFoldersObject;
  let deletedFoldersObject;

  if (getFoldersError || getDeletedFoldersError) {
    console.log("error");
  } else if (getFoldersLoading || getDeletedFoldersLoading) {
    console.log("loading");
  } else {
    let myFolders = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); //convert folders to Folder[]
    let deletedFolders = deletedFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    );

    // folderNavTrees[0].isOpened = false;
    // folderNavTrees[0].iconClass = "magneto.my.boards";
    // publicFolderNavTrees[0].isOpened = false;
    // publicFolderNavTrees[0].iconClass = "'magneto.lycee.connecte.boards";
    // deletedFolderNavTrees[0].isOpened = false;
    // deletedFolderNavTrees[0].iconClass = "magneto.trash";

    myFoldersObject = folderNavTrees[0].buildFolders(myFolders);
    deletedFoldersObject =
      deletedFolderNavTrees[0].buildFolders(deletedFolders);
  }

  return (
    <>
      <Header onClick={toggle} />

      <Grid>
        <Grid.Col
          sm="3"
          style={{
            minHeight: "70rem",
            padding: ".8rem",
          }}
        >
          <aside className="g-col-3 g-col-lg-2 g-col-xl-3 border-end pt-16 pe-16 d-none d-lg-block">
            <TreeViewContainer
              folders={myFoldersObject}
              folderType={FOLDER_TYPE.MY_BOARDS}
            />
            <TreeViewContainer
              folders={{
                children: [],
                id: FOLDER_TYPE.PUBLIC_BOARDS,
                name: t("magneto.lycee.connecte.boards"),
                section: true,
              }}
              folderType={FOLDER_TYPE.MY_BOARDS}
            />
            <TreeViewContainer
              folders={deletedFoldersObject}
              folderType={FOLDER_TYPE.DELETED_BOARDS}
            />
            <TreeViewButtons />
          </aside>
        </Grid.Col>
        <Grid.Col
          sm="8"
          style={{
            minHeight: "10rem",
            padding: ".8rem",
          }}
        >
          <Card title={"Main"} content={"NON"} />
        </Grid.Col>
      </Grid>
    </>
  );
};
