import { useCallback, useEffect, useState } from "react";

import { Grid, useToggle, SearchBar } from "@edifice-ui/react";
import { mdiFolder } from "@mdi/js";
import Icon from "@mdi/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useTranslation } from "react-i18next";

import { BoardList } from "~/components/board-list/BoardList";
import { isBoardInFilter } from "~/components/board-list/utils";
import { CreateBoard } from "~/components/create-board/CreateBoard";
import { DrawerSideBar } from "~/components/drawer-sidebar/DrawerSideBar";
import { EmptyState } from "~/components/empty-state/EmptyState";
import { FolderList } from "~/components/folder-list/FolderList";
import { FolderTitle } from "~/components/folder-title/FolderTitle";
import Header from "~/components/header/Header";
import { MessageModal } from "~/components/message-modal/MessageModal";
import { SideBar } from "~/components/side-bar/SideBar";
import { SideMenuContainer } from "~/components/side-menu-container/SideMenuContainer";
import ToasterContainer from "~/components/toaster-container/ToasterContainer";
import adaptColumns from "~/hooks/useAdaptColumns";
import useWindowDimensions from "~/hooks/useWindowDimensions";
import { Board } from "~/models/board.model";
import "./index.scss";
import { Folder } from "~/models/folder.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
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
  const { currentFolder, folders, setSelectedFoldersIds, setSelectedFolders } =
    useFoldersNavigation();
  const { boards, selectedBoards, setSelectedBoards, setSelectedBoardsIds } =
    useBoardsNavigation();
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

  const resetBoardsAndFolders = useCallback(() => {
    setSearchText("");
    resetSearchBar(searchBarResetter + 1);
    setSelectedBoardsIds([]);
    setSelectedFoldersIds([]);
    setSelectedBoards([]);
    setSelectedFolders([]);
  }, [
    searchBarResetter,
    setSelectedBoards,
    setSelectedBoardsIds,
    setSelectedFolders,
    setSelectedFoldersIds,
  ]);

  useEffect(() => {
    resetBoardsAndFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      resetBoardsAndFolders();
    }
  };

  useEffect(() => {
    const checkTitle = () => {
      if (document.title !== t("magneto.title")) {
        document.title = t("magneto.title");
      }
    };
    const intervalId = setInterval(checkTitle, 250);
    return () => clearInterval(intervalId);
  }, [t]);

  const isSearchResultEmpty =
    !folders.filter((folder: Folder) => {
      if (searchText === "") {
        return folder;
      } else if (
        folder.title.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return folder;
      }
    }).length &&
    !boards.filter((board: Board) => {
      if (searchText === "") {
        return board;
      } else if (isBoardInFilter(board, searchText)) {
        return board;
      }
    }).length;

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
        <Grid className="main-grid">
          <Grid.Col
            lg={width < 1280 ? "2" : "3"} //Since number of columns reduce by 4 at 1280px but doesnt take in account our md columns configuration until 1024px, we're manually changing it
            md="2"
            sm="4"
            className="gridSidebar"
            style={{
              padding: ".8rem",
            }}
          >
            {!drawer ? (
              <SideBar
                dragAndDropBoards={dragAndDropBoards}
                onDragAndDrop={handleDragAndDropBoards}
                onSetShowModal={setShowModal}
                modalProps={modalProps}
                onSetModalProps={setModalProps}
              />
            ) : null}
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
            {isSearchResultEmpty && (folders.length || boards.length) ? (
              <EmptyState title={t("magneto.search.no.result")}></EmptyState>
            ) : null}
            {!folders.length && !boards.length ? (
              <EmptyState title={t("magneto.element.empty.text")}></EmptyState>
            ) : null}
            <FolderList
              searchText={searchText}
              dragAndDropBoards={dragAndDropBoards}
              onDragAndDrop={handleDragAndDropBoards}
              onSetShowModal={setShowModal}
              modalProps={modalProps}
              onSetModalProps={setModalProps}
            />
            <BoardList
              searchText={searchText}
              onDragAndDrop={handleDragAndDropBoards}
            />
            <ToasterContainer
              reset={resetBoardsAndFolders}
              onSetShowModal={setShowModal}
              modalProps={modalProps}
              onSetModalProps={setModalProps}
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
