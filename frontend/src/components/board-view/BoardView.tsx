import { FC } from "react";

import "./BoardView.scss";

import { SideMenu } from "../side-menu/SideMenu";
import { ZoomComponent } from "../zoom-component/ZoomComponent";
import { useSideMenuData } from "~/hooks/useSideMenuData";
import { useBoard } from "~/providers/BoardProvider";

export const BoardView: FC = () => {
  const sideMenuData = useSideMenuData();
  const { zoomLevel, zoomIn, zoomOut, resetZoom } = useBoard();
  const { board } = useBoard();

  return (
    <>
      <SideMenu sideMenuData={sideMenuData} />
      <div>
        {board.sections[0]?.cards?.map((card) => {
          return (
            <SidemenuIcon
              action={menuIcon.action}
              icon={menuIcon.icon}
              name={menuIcon.name}
            />
          );
        })}
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
