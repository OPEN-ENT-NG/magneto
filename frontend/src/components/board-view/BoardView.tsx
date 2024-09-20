import { FC, useEffect } from "react";

import "./BoardView.scss";

import { LoadingScreen } from "@edifice-ui/react";
import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { BoardBodyWrapper, BoardViewWrapper } from "./style";
import { useHeaderHeight } from "./useHeaderHeight";
import { CardsFreeLayout } from "../cards-free-layout/CardsFreeLayout";
import { CardsHorizontalLayout } from "../cards-horizontal-layout/CardsHorizontalLayout";
import { CardsVerticalLayout } from "../cards-vertical-layout/CardsVerticalLayout";
import { HeaderView } from "../header-view/HeaderView";
import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";

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
    boardRights,
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
      <SideMenu sideMenuData={sideMenuData} />
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
