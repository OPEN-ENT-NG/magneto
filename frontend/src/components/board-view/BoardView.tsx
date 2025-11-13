import { FC, useEffect, DragEvent, useState } from "react";

import "./BoardView.scss";

import { Paper } from "@cgi-learning-hub/ui";
import { LoadingScreen, useEdificeClient } from "@edifice.io/react";
import { MediaLibrary } from "@edifice.io/react/multimedia";
import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, GlobalStyles } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  BoardBodyWrapper,
  BoardViewWrapper,
  emptyStateStyle,
  getMainContainerStyles,
  mediaLibraryStyle,
  paperStyle,
} from "./style";
import { useHeaderHeight } from "./useHeaderHeight";
import { BoardCreateMagnetBoardModal } from "../board-create-magnet-board-modal/BoardCreateMagnetBoardModal";
import { BoardCreateMagnetMagnetModal } from "../board-create-magnet-magnet-modal/BoardCreateMagnetMagnetModal";
import { CardsFreeLayout } from "../cards-free-layout/CardsFreeLayout";
import { CardsHorizontalLayout } from "../cards-horizontal-layout/CardsHorizontalLayout";
import { CardsVerticalLayout } from "../cards-vertical-layout/CardsVerticalLayout";
import { CreateBoard } from "../create-board/CreateBoard";
import { CreateMagnet } from "../create-magnet/CreateMagnet";
import { FileDropZone } from "../file-drop-zone/FileDropZone";
import { HeaderView } from "../header-view/HeaderView";
import { PreviewModal } from "../Preview-modal/PreviewModal";
import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { RootsConst } from "~/core/constants/roots.const";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useTheme } from "~/hooks/useTheme";
import { useBoard } from "~/providers/BoardProvider";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const BoardView: FC = () => {
  const { t } = useTranslation("magneto");
  const sideMenuData = useSideMenuData();
  const {
    board,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
    isLoading,
    hasEditRights,
    displayModals,
    toggleBoardModals,
    setIsFileDragging,
    isFileDragging,
    activeCard,
    isExternalView,
    hasNoCards,
    searchText,
  } = useBoard();
  const headerHeight = useHeaderHeight();
  const { isTheme1D } = useTheme();
  const [, setDragCounter] = useState<number>(0);
  const {
    magnetType,
    onClose,
    isCreateMagnetOpen,
    mediaLibraryRef,
    mediaLibraryHandlers,
  } = useMediaLibrary();
  const { appCode } = useEdificeClient();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight}px`,
    );
  }, [headerHeight]);

  const displayLayout = () => {
    switch (board.layoutType) {
      case LAYOUT_TYPE.FREE:
        return <CardsFreeLayout />;
      case LAYOUT_TYPE.VERTICAL:
        return <CardsVerticalLayout />;
      case LAYOUT_TYPE.HORIZONTAL:
        return <CardsHorizontalLayout />;
      default:
        return <CardsFreeLayout />;
    }
  };

  const handleDragEnter = (event: DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    if (event.dataTransfer?.types.includes("Files")) {
      setDragCounter((prev) => {
        const newCount = prev + 1;
        if (newCount === 1) {
          setIsFileDragging(true);
        }
        return newCount;
      });
    }
  };

  const handleDragLeave = (event: DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    setDragCounter((prev) => {
      const newCount = prev - 1;
      if (newCount <= 0) {
        setIsFileDragging(false);
        return 0;
      }
      return newCount;
    });
  };

  const handleDragOver = (event: DragEvent): void => {
    event.preventDefault();
    event.stopPropagation();
  };
  const handleResetDrag = () => {
    setDragCounter(0);
    setIsFileDragging(false);
  };

  return isLoading ? (
    <LoadingScreen position={false} />
  ) : (
    <>
      <GlobalStyles
        key="main-style-view"
        styles={getMainContainerStyles(hasEditRights(), isTheme1D)}
      />
      <BoardViewWrapper layout={board.layoutType}>
        <HeaderView />
        {hasEditRights() && <SideMenu sideMenuData={sideMenuData} />}
        <BoardBodyWrapper
          layout={board.layoutType}
          headerHeight={headerHeight}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
        >
          {displayLayout()}
          {hasEditRights() && isFileDragging && (
            <FileDropZone handleResetdrag={handleResetDrag} />
          )}
          {board.backgroundUrl ? (
            <img
              src={
                isExternalView
                  ? board.backgroundUrl.replace(
                      RootsConst.workspace,
                      RootsConst.workspacePublic,
                    )
                  : board.backgroundUrl
              }
              alt="backgroundImage"
              className="background-image"
            ></img>
          ) : (
            <div className="no-background-image"></div>
          )}
          {searchText && hasNoCards ? (
            <Box sx={emptyStateStyle}>
              <Paper sx={paperStyle} elevation={3}>
                {t("magneto.board.search.emptystate")}
              </Paper>
            </Box>
          ) : (
            !board.cardIds?.length &&
            !board.sections?.length && (
              <div className="cards-empty-state">
                <div className="card-empty-state-message">
                  {t("magneto.add.content.from.menu")}
                </div>
                <Icon path={mdiKeyboardBackspace} size={7} />
              </div>
            )
          )}
        </BoardBodyWrapper>
        {isCreateMagnetOpen && <CreateMagnet />}
        {activeCard && displayModals.CARD_PREVIEW && <PreviewModal />}
        <BoardCreateMagnetMagnetModal
          open={magnetType === MENU_NOT_MEDIA_TYPE.CARD}
          onClose={onClose}
        />
        <BoardCreateMagnetBoardModal
          open={displayModals.BOARD_SELECTION}
          onClose={() => toggleBoardModals(BOARD_MODAL_TYPE.BOARD_SELECTION)}
        />
        <CreateBoard
          isOpen={displayModals.PARAMETERS}
          toggle={() => toggleBoardModals(BOARD_MODAL_TYPE.PARAMETERS)}
          boardToUpdate={board}
        />
        <div className="zoom-container">
          <ZoomComponent
            zoomLevel={zoomLevel}
            zoomMaxLevel={5}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetZoom={resetZoom}
          />
        </div>
      </BoardViewWrapper>
      <Box sx={mediaLibraryStyle} id="media-library-magneto">
        <MediaLibrary
          appCode={appCode}
          ref={mediaLibraryRef}
          multiple={false}
          visibility={board.isExternal ? "public" : "protected"}
          {...mediaLibraryHandlers}
        />
      </Box>
    </>
  );
};
