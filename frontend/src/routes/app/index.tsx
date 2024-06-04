import React, { useState } from "react";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Grid, useToggle, SearchBar } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";

import { BoardList } from "~/components/board-list/BoardList";
import { CreateBoard } from "~/components/create-board/CreateBoard";
import { FolderList } from "~/components/folder-list/FolderList";
import Header from "~/components/header/Header";
import { SideBar } from "~/components/side-bar/SideBar";
import ToasterContainer from "~/components/toaster-container/ToasterContainer";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";

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

  const [currentFolder, setCurrentFolder] = useState(
    new Folder(FOLDER_TYPE.MY_BOARDS),
  );

  const [boardIds, setBoardIds] = useState<String[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Board[]>([]);
  const [folderIds, setFolderIds] = useState<String[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);
  const [boardTargetFolder, setBoardTargetFolder] = useState(new Folder());

  const handleSelectFolder = (folder: Folder) => {
    setCurrentFolder(folder);
  };

  const resetBoardsAndFolders = () => {
    setBoardIds([]);
    setFolderIds([]);
    setSelectedBoards([]);
    setSelectedFolders([]);
  };

  useEffect(() => {
    resetBoardsAndFolders();
  }, [currentFolder]);

  return (
    <>
      <Header onClick={toggle} />
      <DndProvider backend={HTML5Backend}>
        <Grid>
          <Grid.Col
            sm="3"
            style={{
              minHeight: "70rem",
              padding: ".8rem",
            }}
          >

          <SideBar currentFolder={currentFolder} onSelect={handleSelectFolder} />

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
      </DndProvider>
    </> 
  );
};
