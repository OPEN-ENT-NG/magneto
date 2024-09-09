import { FC, useEffect } from "react";

import "./BoardView.scss";

import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { useHeaderHeight } from "./useHeaderHeight";
import { CardsVerticalLayout } from "../cards-vertical-layout/CardsVerticalLayout";
import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { CardsFreeLayout } from "../cards-free-layout/CardsFreeLayout";

export const BoardView: FC = () => {
  const { t } = useTranslation("magneto");

  const sideMenuData = useSideMenuData();
  const { board, zoomLevel, zoomIn, zoomOut, resetZoom } = useBoard();
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
        return null; //freelayout quand il sera up
      case LAYOUT_TYPE.VERTICAL:
        return <CardsVerticalLayout />;
      case LAYOUT_TYPE.HORIZONTAL:
        return null; //horizontallayout quand il sera up
      default:
        return null; //freelayout quand il sera up
    }
  };

  const getBoardLayout = () => {
    switch(board.layoutType) {
       case LAYOUT_TYPE.FREE:
        return <CardsFreeLayout />;
      case LAYOUT_TYPE.HORIZONTAL:
        return <div>HORIZONTAL</div>;
      case LAYOUT_TYPE.VERTICAL:
        return <div>VERTICAL</div>;
      default:
        return <></>;
    }
  }

  return (
    <>
      <SideMenu sideMenuData={sideMenuData} />
      <div
        className="board-body"
        style={{ height: `calc(100vh - ${headerHeight}px)` }}
      >
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

        {(!!board.cardIds?.length || !!board.sections?.length) && (
          <div className="board-layout">
            {getBoardLayout()}
          </div>
        )}

        
      </div>

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
    </>
  );
};
