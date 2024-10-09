import { FC, useEffect, useState } from "react";

import "./BoardView.scss";

import { LoadingScreen } from "@edifice-ui/react";
import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { BoardBodyWrapper, BoardViewWrapper } from "./style";
import { IsModalOpenState } from "./types";
import { useHeaderHeight } from "./useHeaderHeight";
import { initialIsModalOpenState } from "./utils";
import { BoardCreateMagnetMagnetModal } from "../board-create-magnet-magnet-modal/BoardCreateMagnetMagnetModal";
import { CardsFreeLayout } from "../cards-free-layout/CardsFreeLayout";
import { CardsHorizontalLayout } from "../cards-horizontal-layout/CardsHorizontalLayout";
import { CardsVerticalLayout } from "../cards-vertical-layout/CardsVerticalLayout";
import { CreateBoard } from "../create-board/CreateBoard";
import { CreateMagnet } from "../create-magnet/CreateMagnet";
import { HeaderView } from "../header-view/HeaderView";
import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";

export const BoardView: FC = () => {
  const { t } = useTranslation("magneto");
  const [isModalOpen, setIsModalOpen] = useState<IsModalOpenState>(
    initialIsModalOpenState,
  );
  const sideMenuData = useSideMenuData(setIsModalOpen);
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
  } = useBoard();
  const headerHeight = useHeaderHeight();

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

  return isLoading ? (
    <LoadingScreen position={false} />
  ) : (
    <BoardViewWrapper layout={board.layoutType}>
      <HeaderView />
      {hasEditRights() && <SideMenu sideMenuData={sideMenuData} />}
      <BoardBodyWrapper layout={board.layoutType} headerHeight={headerHeight}>
        {displayLayout()}
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

      <CreateMagnet />

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
  );
};
