import React from "react";
import { useEffect, useState } from 'react';


import { Heading, TreeView, Grid } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";

import { Card } from "~/components/card/Card.tsx";
import { TreeViewContainer } from "~/components/tree-view/TreeViewContainer";
import { getFolders } from "~/services/api/folders.service";
import { getBoards } from "~/services/api/boards.service";

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
  console.log("i am in app");

  const [isLoading, setIsLoading] = useState(false);
  const [openedFolder, setOpenedFolder] = useState(null);
  const [displayBoardLightbox, setDisplayBoardLightbox] = useState(false);
  const [displayDeleteBoardLightbox, setDisplayDeleteBoardLightbox] = useState(false);
  const [displayFolderLightbox, setDisplayMoveBoardLightbox] = useState(false);
  const [displayMoveBoardLightbox, setDisplayFolderLightbox] = useState(false);
  const [displayCollectionLightbox, setDisplayCollectionLightbox] = useState(false);
  const [displayShareBoardLightbox, setDisplayShareBoardLightbox] = useState(false);
  const [displayShareFolderLightbox, setDisplayShareFolderLightbox] = useState(false);
  const [displayPublicShareBoardLightbox, setDisplayPublicShareBoardLightbox] = useState(false);
  const [displayEnterSharedFolderWarningLightbox, setDisplayEnterSharedFolderWarningLightbox] = useState(false);
  const [displayExitSharedFolderWarningLightbox, setDisplayExitSharedFolderWarningLightbox] = useState(false);
  const [displayMoveNoRightInFolderLightbox, setDisplayMoveNoRightInFolderLightbox] = useState(false);
  const [isFromMoveBoardLightbox, setIsFromMoveBoardLightbox] = useState(false);

  //this.magnetoStandalone = this.$window.magnetoStandalone == "true";
  // this.filter = new BoardsFilter();

  const [boards, setBoards] = useState([]);
  const [currentFolderChildren, setCurrentFolderChildren] = useState([]);
  const [selectedBoardIds, setSelectedBoardIds] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [folderNavTrees, setFolderNavTrees] = useState([]);
  const [folderMoveNavTrees, setFolderMoveNavTrees] = useState([]);
  // this.selectedUpdateBoardForm = new BoardForm();
  // this.selectedUpdateFolderForm = {id: null, title: ''};
  // this.deletedFolders = await this.getDeletedFolders();

  let folders = getFolders(false);
  let boardList = getBoards({isPublic: false,
    isShared: false,
    isDeleted: false,
    sortBy: 'modificationDate'});

  console.log(folders);
  console.log(boardList);

  return (
    <>
      <Heading headingStyle="h1" level="h1">
        Magneto
      </Heading>
      
      <Grid>
        <Grid.Col
          sm="4"
          style={{
            minHeight: "70rem",
            padding: ".8rem",
          }}
        >

          <TreeViewContainer/>
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
