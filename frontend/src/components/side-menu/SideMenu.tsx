import React, { useEffect, useRef } from "react";

import "./SideMenu.scss";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import HomeIcon from "@mui/icons-material/Home";
import LaptopIcon from "@mui/icons-material/Laptop";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SidemenuIcon } from "../sidemenu-icon/SideMenuIcon";
import {
  mdiBookmarkBoxMultiple,
  mdiCog,
  mdiFileMultiple,
  mdiFormatSize,
  mdiImage,
  mdiLink,
  mdiMusicNote,
  mdiPlayCircle,
} from "@mdi/js";
import Icon from "@mdi/react";

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
