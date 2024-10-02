import { createElement } from "react";

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
import { useTranslation } from "react-i18next";

import {
  SideMenuIconProp,
  SideMenuDividerProp,
} from "~/models/side-menu.model";
import { useMediaLibrary } from "~/providers/MediaLibraryProvider";

export const useSideMenuData = (): (
  | SideMenuIconProp
  | SideMenuDividerProp
)[] => {
  const { t } = useTranslation("magneto");
  const { handleClickMedia } = useMediaLibrary();

  return [
    {
      icon: createElement(Icon, { path: mdiFormatSize, size: 1.5 }),
      name: t("magneto.card.type.text"),
      action: () => {
        console.log("text");
      },
    },
    {
      icon: createElement(Icon, { path: mdiImage, size: 1.5 }),
      name: t("magneto.card.type.image"),
      action: () => handleClickMedia("image"),
    },
    {
      icon: createElement(Icon, { path: mdiPlayCircle, size: 1.5 }),
      name: t("magneto.card.type.video"),
      action: () => handleClickMedia("video"),
    },
    {
      icon: createElement(Icon, { path: mdiMusicNote, size: 1.5 }),
      name: t("magneto.card.type.audio"),
      action: () => handleClickMedia("audio"),
    },
    {
      icon: createElement(Icon, { path: mdiFileMultiple, size: 1.5 }),
      name: t("magneto.card.type.file"),
      action: () => handleClickMedia("attachment"),
    },
    {
      icon: createElement(Icon, { path: mdiLink, size: 1.5 }),
      name: t("magneto.card.type.link"),
      action: () => handleClickMedia("hyperlink"),
    },
    {
      icon: createElement(Icon, {
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
      icon: createElement(Icon, { path: mdiCog, size: 1.5 }),
      name: "",
      action: () => {
        console.log("parameters");
      },
    },
  ];
};
