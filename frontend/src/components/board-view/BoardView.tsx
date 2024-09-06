import { FC } from "react";

import "./BoardView.scss";

import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";
import { useTranslation } from "react-i18next";

export const BoardView: FC = () => {
  const { t } = useTranslation("magneto");

  const sideMenuData = useSideMenuData();
  const { board, zoomLevel, zoomIn, zoomOut, resetZoom } = useBoard();

  return (
    <>
      <SideMenu sideMenuData={sideMenuData} />

      <div className="board-body">
        {!!board.backgroundUrl ? (
          <img
            src={board.backgroundUrl}
            alt="backgroundImage"
            className="background-image"
          ></img>
        ) : (
          <div className="no-background-image"></div>
        )}
        {(board.nbCards ?? 0) + (board.nbCardsSections ?? 0) === 0 && (
          <div> coucou </div>
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
