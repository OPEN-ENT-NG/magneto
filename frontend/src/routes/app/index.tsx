import React from "react";
import { useState } from 'react';

import { Heading, Grid, useToggle } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { Card } from "~/components/card/Card.tsx";
import { CreateTab } from "~/components/create-tab/createTab";
import Header from "~/components/header/Header";
import { TreeViewButtons } from "~/components/tree-view/TreeViewButtons";
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { formControlClasses } from "@mui/material";
import { FolderTreeNavItem, IFolderTreeNavItem } from "~/models/folder-tree.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Folder, IFolderResponse } from "~/models/folder.model";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { SideBar } from "~/components/side-bar/SideBar";

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
  const { t } = useTranslation();

  // const [isLoading, setIsLoading] = useState(false);
  // const [openedFolder, setOpenedFolder] = useState(null);
  // const [displayBoardLightbox, setDisplayBoardLightbox] = useState(false);
  // const [displayDeleteBoardLightbox, setDisplayDeleteBoardLightbox] =
  //   useState(false);
  // const [displayFolderLightbox, setDisplayMoveBoardLightbox] = useState(false);
  // const [displayMoveBoardLightbox, setDisplayFolderLightbox] = useState(false);
  // const [displayCollectionLightbox, setDisplayCollectionLightbox] =
  //   useState(false);
  // const [displayShareBoardLightbox, setDisplayShareBoardLightbox] =
  //   useState(false);
  // const [displayShareFolderLightbox, setDisplayShareFolderLightbox] =
  //   useState(false);
  // const [displayPublicShareBoardLightbox, setDisplayPublicShareBoardLightbox] =
  //   useState(false);
  // const [
  //   displayEnterSharedFolderWarningLightbox,
  //   setDisplayEnterSharedFolderWarningLightbox,
  // ] = useState(false);
  // const [
  //   displayExitSharedFolderWarningLightbox,
  //   setDisplayExitSharedFolderWarningLightbox,
  // ] = useState(false);
  // const [
  //   displayMoveNoRightInFolderLightbox,
  //   setDisplayMoveNoRightInFolderLightbox,
  // ] = useState(false);
  // const [isFromMoveBoardLightbox, setIsFromMoveBoardLightbox] = useState(false);

  //this.magnetoStandalone = this.$window.magnetoStandalone == "true";
  // this.filter = new BoardsFilter();

  // const [boards, setBoards] = useState([]);
  // const [currentFolderChildren, setCurrentFolderChildren] = useState([]);
  // const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  // const [selectedBoards, setSelectedBoards] = useState([]);
  // const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  // const [selectedFolders, setSelectedFolders] = useState([]);
  // const [folderNavTrees, setFolderNavTrees] = useState<FolderTreeNavItem[]>([
  //   new FolderTreeNavItem(
  //     {
  //       id: FOLDER_TYPE.MY_BOARDS,
  //       title: t("magneto.my.boards"),
  //       parentId: "",
  //       section: true,
  //     },
  //     "magneto-check-decagram",
  //   ),
  // ]);
  const folderNavTrees = [
    new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.MY_BOARDS,
        title: t("magneto.my.boards"),
        parentId: "",
        section: true,
      },
      "magneto-check-decagram",
    ),
  ];
  // const [publicFolderNavTrees, setpublicFolderNavTrees] = useState<
  //   FolderTreeNavItem[]
  // >([
  //   new FolderTreeNavItem(
  //     {
  //       id: FOLDER_TYPE.PUBLIC_BOARDS,
  //       title: t("magneto.lycee.connecte.boards"),
  //       parentId: "",
  //       section: true,
  //     },
  //     "magneto-earth",
  //   ),
  // ]);
  // const [deletedFolderNavTrees, setdeletedFolderNavTrees] = useState<
  //   FolderTreeNavItem[]
  // >([
  //   new FolderTreeNavItem(
  //     {
  //       id: FOLDER_TYPE.DELETED_BOARDS,
  //       title: t("magneto.trash"),
  //       parentId: "",
  //       section: true,
  //     },
  //     "magneto.trash",
  //   ),
  // ]);
  const deletedFolderNavTrees = [
    new FolderTreeNavItem(
      {
        id: FOLDER_TYPE.DELETED_BOARDS,
        title: t("magneto.trash"),
        parentId: "",
        section: true,
      },
      "magneto.trash",
    ),
  ];
  // const [folderMoveNavTrees, setFolderMoveNavTrees] = useState([]);

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

  const [boards, setBoards] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderChildren, setCurrentFolderChildren] = useState([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [folderNavTrees, setFolderNavTrees] = useState<FolderTreeNavItem[]>([new FolderTreeNavItem({
      id: FOLDER_TYPE.MY_BOARDS, title: t('magneto.my.boards'), 
      parentId: '', section: true
  }, false, "magneto-check-decagram")]);
  const [publicFolderNavTrees, setpublicFolderNavTrees] = useState<FolderTreeNavItem[]>([new FolderTreeNavItem({
    id: FOLDER_TYPE.PUBLIC_BOARDS, title: t('magneto.lycee.connecte.boards'), 
    parentId: '', section: true
}, false, "magneto-earth")]);
  const [deletedFolderNavTrees, setdeletedFolderNavTrees] = useState<FolderTreeNavItem[]>([new FolderTreeNavItem({
    id: FOLDER_TYPE.DELETED_BOARDS, title: t('magneto.trash'),
    parentId: '', section: true
}, false, "magneto.trash")]);
  const [folderMoveNavTrees, setFolderMoveNavTrees] = useState([]);


  
  const { data: myFoldersResult, isLoading: getFoldersLoading, error: getFoldersError } = useGetFoldersQuery(false);
  const { data: deletedFoldersResult, isLoading: getDeletedFoldersLoading, error: getDeletedFoldersError } = useGetFoldersQuery(true);

  let myFoldersObject;
  let deletedFoldersObject;

  if (getFoldersError || getDeletedFoldersError) {
    console.log("error");
  } else if (getFoldersLoading || getDeletedFoldersLoading) {
    console.log("loading");
  } else {
    const myFolders = myFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    ); //convert folders to Folder[]
    const deletedFolders = deletedFoldersResult.map((folder: IFolderResponse) =>
      new Folder().build(folder),
    );

    myFoldersObject = folderNavTrees[0].buildFolders(myFolders);
    deletedFoldersObject =
      deletedFolderNavTrees[0].buildFolders(deletedFolders);

    myFoldersObject = folderNavTrees[0].buildFolders(myFolders);
    deletedFoldersObject = deletedFolderNavTrees[0].buildFolders(deletedFolders);
  }

  const { data: myBoardsResult, isLoading: getBoardsLoading, error: getBoardsError } = useGetBoardsQuery({
    isPublic: false, isShared: true, isDeleted: false, sortBy: 'modificationDate'});
  console.log(myBoardsResult);

 
  if (getBoardsError) {
    console.log("Boards error");
  } else if (getBoardsLoading) {
    console.log("Boards loading");
  } else { 
    setBoards(myBoardsResult.map(((board: IBoardItemResponse) => new Board().build(board)))); //convert to Board[]
    console.log(boards);

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
=======

        <SideBar />

>>>>>>> 8076f6a... feat(react): #MAG-391 display main page
        </Grid.Col>
        <Grid.Col
          sm="8"
          style={{
            minHeight: "10rem",
            padding: ".8rem",
          }}
        >
          <Card title={"Main"} content={"NON"} />
          <CreateTab isOpen={isOpen} toggle={toggle} />
        </Grid.Col>
      </Grid>
    </>
  );
};
