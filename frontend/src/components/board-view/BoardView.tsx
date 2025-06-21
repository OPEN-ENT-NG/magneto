import { FC, useEffect, DragEvent, useState, useRef } from "react";

import "./BoardView.scss";

import { LoadingScreen, useEdificeClient } from "@edifice.io/react";
import { MediaLibrary } from "@edifice.io/react/multimedia";
import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, GlobalStyles } from "@mui/material";
import { useTranslation } from "react-i18next";

import { BoardBodyWrapper, BoardViewWrapper, mediaLibraryStyle } from "./style";
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
import { useBoard } from "~/providers/BoardProvider";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";
import { Cursor } from "~/features/websocket/components/Cursor";
import useWebSocket, { ReadyState } from "react-use-websocket";

// Implémentation maison du throttle
function throttle<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}


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
  } = useBoard();
  const headerHeight = useHeaderHeight();
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


  // TEST IMPLE CURSOR FOR WEBSOCKET
  const userId = useRef(`user-${Math.floor(Math.random() * 1000)}`);
  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [users, setUsers] = useState<Record<string, { x: number; y: number }>>({});


  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket("ws://localhost:9091", {
    share: true,
    shouldReconnect: () => true,
  });
  
  // Throttle personnalisé pour envoyer la position
  const throttledSendCursor = useRef(
    throttle((x: number, y: number) => {
      sendJsonMessage({
        type: "CURSOR_MOVE",
        userId: userId.current,
        x,
        y,
      });
    }, 50)
  ).current;
  
  // Écoute des messages entrants
  useEffect(() => {
    if (lastJsonMessage) {
      // const data = JSON.parse(lastJsonMessage.data);
      const data: any = lastJsonMessage;
      console.log("data?: ", data);
      if (data.type === "CURSOR_MOVE" && data.userId !== userId.current) {
        console.log("data?: ", data);
        setUsers((prev) => ({
          ...prev,
          [data.userId]: {
            x: data.x,
            y: data.y,
          },
        }));
      }
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    console.log('WebSocket connected, userId:', userId.current);
  }, [readyState]);
  
  useEffect(() => {
    if (lastJsonMessage) {
      console.log('Reçu via WebSocket:', lastJsonMessage);
    }
  }, [lastJsonMessage]);
  
  // Mouvement souris + envoi position via WebSocket
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const [x, y] = [e.clientX, e.clientY];
      setPosition([x, y]);
      throttledSendCursor(x, y);
    };
  
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  


  return isLoading ? (
    <LoadingScreen position={false} />
  ) : (
    <>
      <GlobalStyles
        styles={{
          "main.container-fluid": {
            padding: "0 !important",
            width: "100%",
            margin: hasEditRights() ? " 0 0 0 8.1rem" : "auto",
            maxWidth: "93%",
          },
        }}
      />
      {/* Cursors des autres utilisateurs */}
      {Object.entries(users).map(([id, coords]) => (
        <Cursor key={id} userId={id} point={[coords.x, coords.y]} />
      ))}

      {/* Mon curseur perso */}
      <Cursor key={userId.current} userId={userId.current} point={position} />
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
          {!board.cardIds?.length && !board.sections?.length && (
            <div className="cards-empty-state">
              <div className="card-empty-state-message">
                {t("magneto.add.content.from.menu")}
              </div>
              <Icon path={mdiKeyboardBackspace} size={7} />
            </div>
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
            opacity={0.75}
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
