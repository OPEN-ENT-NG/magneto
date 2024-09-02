import { FC, useRef } from "react";

import "./SideMenu.scss";
import { SidemenuIcon } from "../sidemenu-icon/SideMenuIcon";

type SideMenuIconProp = {
  name: string;
  icon: React.ReactNode;
  action: () => void;
};

type SideMenuDividerProp = {
  divider: boolean;
};

type SideMenuProps = {
  sideMenuData: (SideMenuIconProp | SideMenuDividerProp)[];
};

export const SideMenu: FC<SideMenuProps> = ({ sideMenuData }) => {
  const sidemenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`side-menu open`} ref={sidemenuRef}>
      <div className="icons-container">
        {sideMenuData.map(
          (menuIcon: SideMenuIconProp | SideMenuDividerProp) => {
            return "divider" in menuIcon ? (
              <>{menuIcon.divider && <hr className="items-divider"></hr>}</>
            ) : (
              <SidemenuIcon
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
