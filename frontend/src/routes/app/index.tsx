import React from "react";
//import { useState } from 'react';

import { TreeView, Grid, useToggle } from "@edifice-ui/react";
//import { formControlClasses } from "@mui/material";
import { ID } from "edifice-ts-client";

import { Card } from "~/components/card/Card.tsx";
import Header from "~/components/header/Header";
//import { TreeViewContainer } from "~/components/tree-view/TreeViewContainer";
//import { getBoards } from "~/services/api/boards.service";
import { useGetFoldersQuery } from "~/services/api/folders.service";
import { formControlClasses } from "@mui/material";
import { CreateTab } from "~/components/create-tab/createTab";

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

  /*const [isLoading, setIsLoading] = useState(false);
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
  // this.deletedFolders = await this.getDeletedFolders();*/


  const { data: folders } = useGetFoldersQuery(false);
  console.log(folders);



  return (
    <>
      <Header onClick={toggle} />

      <Grid>
        <Grid.Col
          sm="4"
          style={{
            minHeight: "70rem",
            padding: ".8rem",
          }}
        ></Grid.Col>
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
      <>
        <Grid>
          <Grid.Col
            sm="4"
            style={{
              minHeight: "70rem",
              padding: ".8rem",
            }}
          >
            <TreeView
              data={{
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                id: "12",
                                name: "level 4 arborescence tree",
                              },
                              {
                                id: "13",
                                name: "level 4 arborescence tree",
                              },
                            ],
                            id: "8",
                            name: "level 3 arborescence tree",
                          },
                          {
                            id: "9",
                            name: "level 3 arborescence tree",
                          },
                        ],
                        id: "4",
                        name: "level 2 arborescence tree",
                      },
                      {
                        children: [
                          {
                            id: "10",
                            name: "level 3 arborescence tree",
                          },
                          {
                            id: "11",
                            name: "level 3 arborescence tree",
                          },
                        ],
                        id: "5",
                        name: "level 2 arborescence tree",
                      },
                    ],
                    id: "1",
                    name: "level 1 arborescence tree",
                  },
                  {
                    children: [
                      {
                        id: "6",
                        name: "level 2 arborescence tree",
                      },
                      {
                        id: "7",
                        name: "level 2 arborescence tree",
                      },
                    ],
                    id: "2",
                    name: "level 1 arborescence tree",
                  },
                  {
                    id: "3",
                    name: "level 1 arborescence tree",
                  },
                ],
                id: "root",
                name: "Section Element",
                section: true,
              }}
              onTreeItemBlur={function Ga() { }}
              onTreeItemFocus={function Ga() { }}
              onTreeItemFold={function Ga() { }}
              onTreeItemSelect={function Ga() { }}
              onTreeItemUnfold={function Ga() { }}
            />
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
    </>
  );
};
