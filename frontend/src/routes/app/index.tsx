import { useEffect, useState } from "react";

import { Grid, useToggle, SearchBar } from "@edifice-ui/react";
import { mdiFolder } from "@mdi/js";
import Icon from "@mdi/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";

import { CreateBoard } from "~/components/create-board/CreateBoard";
import { DrawerSideBar } from "~/components/drawer-sidebar/DrawerSideBar";
import { EmptyState } from "~/components/empty-state/EmptyState";
import { FolderList } from "~/components/folder-list/FolderList";
import { FolderTitle } from "~/components/folder-title/FolderTitle";
import Header from "~/components/header/Header";
import { MessageModal } from "~/components/message-modal/MessageModal";
import { SideBar } from "~/components/side-bar/SideBar";
import ToasterContainer from "~/components/toaster-container/ToasterContainer";
import adaptColumns from "~/hooks/useAdaptColumns";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import "./index.scss";
import { useFoldersNavigation } from "~/providers/FoldersNavigationProvider";

export interface AppProps {
  _id: string;
  created: Date;
  description: string;
  map: string;
  modified: Date;
  name: string;
  owner: { userId: string; displayName: string };
  shared: any[];
  thumbnail: string;
}

export const App = () => {
  const { t } = useTranslation("magneto");
  const [isOpen, toggle] = useToggle(false);
  const [searchBarResetter, resetSearchBar] = useState(0);
  const { currentFolder } = useFoldersNavigation();
  const [selectedBoardIds, setSelectedBoardIds] = useState<string[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Board[]>([]);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
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
  const { folders } = useFoldersNavigation();

  const resetBoardsAndFolders = () => {
    setSearchText("");
    resetSearchBar(searchBarResetter + 1);
    setSelectedBoardIds([]);
    setSelectedFolderIds([]);
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
          drawer={drawer}
          toggleDrawer={toggleDrawer}
          dragAndDropBoards={dragAndDropBoards}
          onDragAndDrop={handleDragAndDropBoards}
          onSetShowModal={setShowModal}
          modalProps={modalProps}
          onSetModalProps={setModalProps}
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
            <div className="search-bar-wrapper">
              <SearchBar
                onClick={() => null}
                placeholder={t("magneto.search.placeholder")}
                size="md"
                isVariant={false}
                key={searchBarResetter}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </div>
            <FolderTitle
              text={currentFolder.title}
              SVGLeft={<Icon path={mdiFolder} />}
            />

            {(!folders.length && !boards.length) ??
              <EmptyState title={t("magneto.boards.empty.text")}></EmptyState>
            }

            <FolderList
              selectedFolderIds={selectedFolderIds}
              selectedFolders={selectedFolders}
              setSelectedFolderIds={setSelectedFolderIds}
              setSelectedFolders={setSelectedFolders}
              searchText={searchText}
              dragAndDropBoards={dragAndDropBoards}
              onDragAndDrop={handleDragAndDropBoards}
              onSetShowModal={setShowModal}
              modalProps={modalProps}
              onSetModalProps={setModalProps}
            />
            {/* <BoardList
              boards={boards}
              setBoards={setBoards}
              currentFolder={currentFolder}
              selectedBoardIds={selectedBoardIds}
              selectedBoards={selectedBoards}
              setSelectedBoardIds={setSelectedBoardIds}
              setSelectedBoards={setSelectedBoards}
              searchText={searchText}
              onDragAndDrop={handleDragAndDropBoards}
            /> */}
            <ToasterContainer
              isToasterOpen={
                selectedBoards.length > 0 || selectedFolders.length > 0
              }
              boards={selectedBoards}
              folders={selectedFolders}
              selectedBoardIds={selectedBoardIds}
              selectedFolderIds={selectedFolderIds}
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
