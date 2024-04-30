import React from "react";
import { useState } from 'react';

import { Heading, Grid, useToggle } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { useTranslation } from "react-i18next";

import { Card } from "~/components/card/Card.tsx";
import { CreateTab } from "~/components/create-tab/createTab";
import Header from "~/components/header/Header";

import { formControlClasses } from "@mui/material";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { SideBar } from "~/components/side-bar/SideBar";
import { ContentPage } from "~/components/content-page/ContentPage";

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

  const [boards, setBoards] = useState([]);
  // const [currentFolderChildren, setCurrentFolderChildren] = useState([]);
  // const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  // const [selectedBoards, setSelectedBoards] = useState([]);
  // const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  // const [selectedFolders, setSelectedFolders] = useState([]);


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

        <SideBar />

        </Grid.Col>

        <Grid.Col
          sm="8"
          style={{
            minHeight: "10rem",
            padding: ".8rem",
          }}
        >
          <ContentPage />
          <Card title={"Main"} content={"NON"} />
          <CreateTab isOpen={isOpen} toggle={toggle} />
        </Grid.Col>
      </Grid>
    </>
  );
};
