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
import { t } from "i18next";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";
import React from "react";

type SideMenuIconProp = {
  name: string;
  icon: React.ReactNode;
  action: () => void;
};

type SideMenuDividerProp = {
  divider: boolean;
};

export const useSideMenuData = (): (
  | SideMenuIconProp
  | SideMenuDividerProp
)[] => {
  const { t } = useTranslation("magneto");

  return [
    {
      icon: React.createElement(Icon, { path: mdiFormatSize, size: 1.5 }),
      name: t("magneto.card.type.text"),
      action: () => {
        console.log("text");
      },
    },
    {
      icon: React.createElement(Icon, { path: mdiImage, size: 1.5 }),
      name: t("magneto.card.type.image"),
      action: () => {
        console.log("image");
      },
    },
    {
      icon: React.createElement(Icon, { path: mdiPlayCircle, size: 1.5 }),
      name: t("magneto.card.type.video"),
      action: () => {
        console.log("video");
      },
    },
    {
      icon: React.createElement(Icon, { path: mdiMusicNote, size: 1.5 }),
      name: t("magneto.card.type.audio"),
      action: () => {
        console.log("audio");
      },
    },
    {
      icon: React.createElement(Icon, { path: mdiFileMultiple, size: 1.5 }),
      name: t("magneto.card.type.file"),
      action: () => {
        console.log("document");
      },
    },
    {
      icon: React.createElement(Icon, { path: mdiLink, size: 1.5 }),
      name: t("magneto.card.type.link"),
      action: () => {
        console.log("link");
      },
    },
    {
      icon: React.createElement(Icon, {
        path: mdiBookmarkBoxMultiple,
        size: 1.5,
      }),
      name: t("magneto.card.type.card"),
      action: () => {
        console.log("magnet");
      },
    },
    {
      divider: true,
    },
    {
      icon: React.createElement(Icon, { path: mdiCog, size: 1.5 }),
      name: "",
      action: () => {
        console.log("parameters");
      },
    },
  ];
};
