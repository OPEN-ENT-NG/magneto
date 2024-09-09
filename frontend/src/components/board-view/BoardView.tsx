import { FC } from "react";

import "./BoardView.scss";

import { mdiKeyboardBackspace } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";

export const BoardView: FC = () => {
  const { t } = useTranslation("magneto");

  const sideMenuData = useSideMenuData();
  const { board, zoomLevel, zoomIn, zoomOut, resetZoom } = useBoard();

  return (
    <>
      <SideMenu sideMenuData={sideMenuData} />

      <div className="board-body">
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
