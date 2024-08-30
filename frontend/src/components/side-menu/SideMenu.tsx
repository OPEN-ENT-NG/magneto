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
import { mdiBookmarkBoxMultiple, mdiCog, mdiFileMultiple, mdiFormatSize, mdiImage, mdiLink, mdiMusicNote, mdiPlayCircle } from "@mdi/js";
import Icon from "@mdi/react";


export const SideMenu: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("magneto");
  const sidemenuRef = useRef<HTMLDivElement>(null);

  const sideMenuData = [
    {
      icon: <Icon path={mdiFormatSize} size={1}/>,
      name: t("magneto.card.type.text"),
      action: () => {console.log("text")}
    },
    {
      icon: <Icon path={mdiImage} size={1}/>,
      name: t("magneto.card.type.image"),
      action: () => {console.log("image")}
    },
    {
      icon: <Icon path={mdiPlayCircle} size={1}/>,
      name: t("magneto.card.type.video"),
      action: () => {console.log("video")}
    },
    {
      icon: <Icon path={mdiMusicNote} size={1}/>,
      name: t("magneto.card.type.audio"),
      action: () => {console.log("audio")}
    },
    {
      icon: <Icon path={mdiFileMultiple} size={1}/>,
      name: t("magneto.card.type.file"),
      action: () => {console.log("document")}
    },
    {
      icon: <Icon path={mdiLink} size={1}/>,
      name: t("magneto.card.type.link"),
      action: () => {console.log("link")}
    },
    {
      icon: <Icon path={mdiBookmarkBoxMultiple} size={1}/>,
      name: t("magneto.card.type.card"),
      action: () => {console.log("magnet")}
    },
  ]


  return (
    <div className={`side-menu open`} ref={sidemenuRef}>
      <div className="icons-container">
        {sideMenuData.map((menuIcon) => {
          return (
            <SidemenuIcon
            action={menuIcon.action}
            icon={menuIcon.icon}
            name={menuIcon.name}
            />
          )
        })
        }
        <hr className="items-divider"></hr>
        <SidemenuIcon
          action={() => {console.log("parameters")}}
          icon={<Icon path={mdiCog} size={1}/>}
          name=""
        />
      </div>
    </div>
  );
};
