import React, { useEffect, useState } from "react";

import { Grid, useToggle, SearchBar } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";

import { BoardList } from "~/components/board-list/BoardList";
import { CreateTab } from "~/components/create-tab/createTab";
import { FolderList } from "~/components/folder-list/FolderList";
import Header from "~/components/header/Header";
import { SideBar } from "~/components/side-bar/SideBar";
import ToasterContainer from "~/components/toaster-container/ToasterContainer";
import { Folder } from "~/models/folder.model";
import { Board } from "~/models/board.model";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";

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

  const [currentFolder, setCurrentFolder] = useState(new Folder(FOLDER_TYPE.MY_BOARDS));

  const [boardIds, setBoardIds] = useState<String[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Board[]>([]);
  const [folderIds, setFolderIds] = useState<String[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);

  const handleSelectFolder = (folder: Folder) => {
    setCurrentFolder(folder);
  };

  useEffect(() => {
    setBoardIds([]);
    setFolderIds([]);
    setSelectedBoards([]);
    setSelectedFolders([]);
  }, [currentFolder]);

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
          <SideBar onSelect={handleSelectFolder} />
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
            onChange={function Ga() { }}
            onClick={function Ga() { }}
            placeholder="Search something...."
            size="md"
          />
          <FolderList
            currentFolder={currentFolder}
            onSelect={handleSelectFolder}
            folderIds={folderIds}
            selectedFolders={selectedFolders}
            setFolderIds={setFolderIds}
            setSelectedFolders={setSelectedFolders}
          />
          <BoardList
            currentFolder={currentFolder}
            boardIds={boardIds}
            selectedBoards={selectedBoards}
            setBoardIds={setBoardIds}
            setSelectedBoards={setSelectedBoards}
          />
          <ToasterContainer
            isToasterOpen={selectedBoards.length > 0 || selectedFolders.length > 0}
            boards={selectedBoards}
            folders={selectedFolders}
            boardIds={boardIds}
            folderIds={folderIds}
            currentFolder={currentFolder}
          />
          <CreateTab isOpen={isOpen} toggle={toggle} />
        </Grid.Col>
      </Grid>
    </>
  );
};
