import { FC, useEffect, DragEvent, useState } from "react";

import "./BoardView.scss";

import { LoadingScreen } from "@edifice-ui/react";
import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { GlobalStyles } from "@mui/material";
import { useTranslation } from "react-i18next";

import { BoardBodyWrapper, BoardViewWrapper } from "./style";
import { useHeaderHeight } from "./useHeaderHeight";
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
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { MENU_NOT_MEDIA_TYPE } from "~/core/enums/menu-not-media-type.enum";
import { useSideMenuData } from "~/hooks/useSideMenuData";
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
  } = useBoard();
  const headerHeight = useHeaderHeight();
  const [, setDragCounter] = useState<number>(0);
  const { magnetType, onClose } = useMediaLibrary();

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
        styles={{
          "main.container-fluid": {
            padding: "0 !important",
            width: "100%",
            marginLeft: hasEditRights() ? "8.1rem" : 0,
            maxWidth: "93%",
          },
        }}
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
              src={board.backgroundUrl}
              alt="backgroundImage"
              className="background-image"
            ></img>
          ) : (
            <div className="no-background-image"></div>
          )}
          {!board.cardIds?.length && !board.sections?.length && (
            <div className="cards-empty-state">
              <div className="card-empty-state-message">
                {t("magneto.add.content.from.menu")}
              </div>
              <Icon path={mdiKeyboardBackspace} size={7} />
            </div>
          )}
        </BoardBodyWrapper>

        <CreateMagnet open={magnetType === MENU_NOT_MEDIA_TYPE.TEXT} />
        {activeCard && displayModals.CARD_PREVIEW && <PreviewModal />}
        <BoardCreateMagnetMagnetModal
          open={magnetType === MENU_NOT_MEDIA_TYPE.CARD}
          onClose={onClose}
        />

        <CreateBoard
          isOpen={displayModals.PARAMETERS}
          toggle={() => toggleBoardModals(BOARD_MODAL_TYPE.PARAMETERS)}
          boardToUpdate={board}
        />

        <div className="zoom-container">
          <ZoomComponent
            opacity={0.75}
            zoomLevel={zoomLevel}
            zoomMaxLevel={5}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetZoom={resetZoom}
          />
        </div>
      </BoardViewWrapper>
    </>
  );
};
