import { FC, useRef } from "react";

import "./SideMenu.scss";
import { SidemenuIcon } from "../sidemenu-icon/SideMenuIcon";
import {
  SideMenuIconProp,
  SideMenuDividerProp,
} from "~/models/side-menu.model";

type SideMenuProps = {
  sideMenuData: (SideMenuIconProp | SideMenuDividerProp)[];
};

export const SideMenu: FC<SideMenuProps> = ({ sideMenuData }) => {
  const sidemenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`side-menu open`} ref={sidemenuRef}>
      <div className="icons-container">
        {sideMenuData.map(
          (menuIcon: SideMenuIconProp | SideMenuDividerProp, index) => {
            return "divider" in menuIcon ? (
              <div key={`divider-${Date.now() + index}`}>
                {menuIcon.divider && <hr className="items-divider"></hr>}
              </div>
            ) : (
              <SidemenuIcon
                key={menuIcon.name}
                action={menuIcon.action}
                icon={menuIcon.icon}
                name={menuIcon.name}
              />
            );
          },
        )}
      </div>
    </div>
  );
};
