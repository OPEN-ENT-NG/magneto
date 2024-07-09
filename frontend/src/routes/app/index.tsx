import React, { useEffect, useState } from "react";

import { Grid, useToggle, SearchBar } from "@edifice-ui/react";
import { ID } from "edifice-ts-client";
import { t } from "i18next";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { BoardList } from "~/components/board-list/BoardList";
import { CreateBoard } from "~/components/create-board/CreateBoard";
import { DrawerSideBar } from "~/components/drawer-sidebar/DrawerSideBar";
import { FolderList } from "~/components/folder-list/FolderList";
import Header from "~/components/header/Header";
import { MessageModal } from "~/components/message-modal/MessageModal";
import { SideBar } from "~/components/side-bar/SideBar";
import ToasterContainer from "~/components/toaster-container/ToasterContainer";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import adaptColumns from "~/hooks/useAdaptColumns";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import "./index.scss";

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
  const [searchBarResetter, resetSearchBar] = useState(0);

  const [currentFolder, setCurrentFolder] = useState(
    new Folder(FOLDER_TYPE.MY_BOARDS),
  );

  const [boardIds, setBoardIds] = useState<string[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Board[]>([]);
  const [folderIds, setFolderIds] = useState<string[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<Folder[]>([]);
  const [dragAndDropBoards, setDragAndDropBoards] = useState<Board[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    isOpen: false,
    i18nKey: "",
    param: "",
    hasSubmit: false,
    onSubmit: () => {},
    onCancel: () => {},
  });
  const [searchText, setSearchText] = useState<string>("");
  const [drawer, toggleDrawer] = useToggle(false);
  const { width } = useWindowDimensions();

  const handleSelectFolder = (folder: Folder) => {
    setCurrentFolder(folder);
    setSearchText("");
    resetSearchBar(searchBarResetter + 1);
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

  const handleDragAndDropBoards = (board: Board) => {
    if (
      !!board &&
      selectedBoards.find(
        (selectedBoard: Board) => selectedBoard._id == board._id,
      )
    ) {
      setDragAndDropBoards(selectedBoards);
    } else if (board) {
      setDragAndDropBoards([board]);
    }
  };

  return (
    <>
      <Header onClick={toggle} toggleDrawer={toggleDrawer} />
      <DndProvider backend={HTML5Backend}>
        <DrawerSideBar
          onSelect={handleSelectFolder}
          drawer={drawer}
          toggleDrawer={toggleDrawer}
        />
        <Grid>
          <Grid.Col
            lg={width < 1280 ? "2" : "3"} //Since number of columns reduce by 4 at 1280px but doesnt take in account our md columns configuration until 1024px, we're manually changing it
            md="2"
            sm="4"
            className="gridSidebar"
            style={{
              padding: ".8rem",
            }}
          >
            <SideBar
              currentFolder={currentFolder}
              onSelect={handleSelectFolder}
              dragAndDropBoards={dragAndDropBoards}
              onDragAndDrop={handleDragAndDropBoards}
              onSetShowModal={setShowModal}
              modalProps={modalProps}
              onSetModalProps={setModalProps}
            />
          </Grid.Col>

          <Grid.Col
            lg={adaptColumns(width)}
            md="8"
            sm="4"
            style={{
              minHeight: "10rem",
              padding: ".8rem",
            }}
          >
            <SearchBar
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder={t("magneto.search.placeholder")}
              size="md"
              isVariant
              key={searchBarResetter}
            />
            <FolderList
              currentFolder={currentFolder}
              onSelect={handleSelectFolder}
              folderIds={folderIds}
              selectedFolders={selectedFolders}
              setFolderIds={setFolderIds}
              setSelectedFolders={setSelectedFolders}
              searchText={searchText}
              dragAndDropBoards={dragAndDropBoards}
              onDragAndDrop={handleDragAndDropBoards}
              onSetShowModal={setShowModal}
              modalProps={modalProps}
              onSetModalProps={setModalProps}
            />
            <BoardList
              currentFolder={currentFolder}
              boardIds={boardIds}
              selectedBoards={selectedBoards}
              setBoardIds={setBoardIds}
              setSelectedBoards={setSelectedBoards}
              searchText={searchText}
              onDragAndDrop={handleDragAndDropBoards}
            />
            <ToasterContainer
              isToasterOpen={
                selectedBoards.length > 0 || selectedFolders.length > 0
              }
              boards={selectedBoards}
              folders={selectedFolders}
              boardIds={boardIds}
              folderIds={folderIds}
              currentFolder={currentFolder}
              reset={resetBoardsAndFolders}
            />
            <CreateBoard isOpen={isOpen} toggle={toggle} />
            <MessageModal
              isOpen={showModal}
              i18nKey={modalProps.i18nKey}
              param={modalProps.param}
              hasSubmit={modalProps.hasSubmit}
              onSubmit={modalProps.onSubmit}
              onCancel={modalProps.onCancel}
            ></MessageModal>
          </Grid.Col>
        </Grid>
      </DndProvider>
    </>
  );
};
