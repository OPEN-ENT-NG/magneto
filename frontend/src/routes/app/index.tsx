import React, { useState } from "react";

import { Heading, Grid, useToggle, SearchBar } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";

import { CreateTab } from "~/components/create-tab/createTab";
import Header from "~/components/header/Header";
import { SideBar } from "~/components/side-bar/SideBar";
import { BoardList } from "~/components/board-list/BoardList";
import { FolderList } from "~/components/folder-list/FolderList";
import ToasterContainer from "~/components/toaster-container/ToasterContainer";
import { Folder } from "~/models/folder.model";
import { useTranslation } from "react-i18next";

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

  const [currentFolder, setCurrentFolder] = useState(new Folder());


  const handleSelectFolder = (folder: Folder) => {
    setCurrentFolder(folder);
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

        <SideBar currentFolder={currentFolder} setCurrentFolder={handleSelectFolder} />

        </Grid.Col>

        <Grid.Col
          sm="8"
          style={{
            minHeight: "10rem",
            padding: ".8rem",
          }}
        >
          <SearchBar
            isVariant
            onChange={function Ga(){}}
            onClick={function Ga(){}}
            placeholder="Search something...."
            size="md"
          />
          <FolderList currentFolder={currentFolder} onSelect={handleSelectFolder} />
          <ToasterContainer />
          <BoardList currentFolder={currentFolder} />
          <CreateTab isOpen={isOpen} toggle={toggle} />
        </Grid.Col>
      </Grid>
    </>
  );
};
