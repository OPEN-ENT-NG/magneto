import React, { useRef } from "react";

import "./SideMenu.scss";
import { SidemenuIcon } from "../sidemenu-icon/SideMenuIcon";

type SideMenuProps = {
  sideMenuData: Array<{
    name: string;
    icon?: React.ReactNode;
    action?: () => void;
  }>;
};

export const SideMenu: React.FC<SideMenuProps> = ({ sideMenuData }) => {
  const sidemenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`side-menu open`} ref={sidemenuRef}>
      <div className="icons-container">
        {sideMenuData.map((menuIcon) => {
          return !!menuIcon.action && !!menuIcon.icon ? (
            <SidemenuIcon
              action={menuIcon.action}
              icon={menuIcon.icon}
              name={menuIcon.name}
            />
          ) : (
            <hr className="items-divider"></hr>
          );
        })}
      </div>
    </div>
  );
};
