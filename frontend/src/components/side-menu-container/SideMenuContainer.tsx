import React, { useRef } from "react";

import { useTranslation } from "react-i18next";
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
import { SideMenu } from "../side-menu/SideMenu";

export const SideMenuContainer: React.FC = () => {
  const { t } = useTranslation("magneto");

  const sideMenuData = [
    {
      icon: <Icon path={mdiFormatSize} size={1} />,
      name: t("magneto.card.type.text"),
      action: () => {
        console.log("text");
      },
    },
    {
      icon: <Icon path={mdiImage} size={1} />,
      name: t("magneto.card.type.image"),
      action: () => {
        console.log("image");
      },
    },
    {
      icon: <Icon path={mdiPlayCircle} size={1} />,
      name: t("magneto.card.type.video"),
      action: () => {
        console.log("video");
      },
    },
    {
      icon: <Icon path={mdiMusicNote} size={1} />,
      name: t("magneto.card.type.audio"),
      action: () => {
        console.log("audio");
      },
    },
    {
      icon: <Icon path={mdiFileMultiple} size={1} />,
      name: t("magneto.card.type.file"),
      action: () => {
        console.log("document");
      },
    },
    {
      icon: <Icon path={mdiLink} size={1} />,
      name: t("magneto.card.type.link"),
      action: () => {
        console.log("link");
      },
    },
    {
      icon: <Icon path={mdiBookmarkBoxMultiple} size={1} />,
      name: t("magneto.card.type.card"),
      action: () => {
        console.log("magnet");
      },
    },
    {
      name: "side-menu-divider",
    },
    {
      icon: <Icon path={mdiCog} size={1} />,
      name: "",
      action: () => {
        console.log("parameters");
      },
    },
  ];

  return (
    <SideMenu sideMenuData={sideMenuData} />
  );
};
