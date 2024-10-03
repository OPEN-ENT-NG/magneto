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

import { MEDIA_LIBRARY_TYPE } from "~/core/enums/media-library-type.enum";
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
      action: () => console.log("text"),
    },
    {
      icon: createElement(Icon, { path: mdiImage, size: 1.5 }),
      name: t("magneto.card.type.image"),
      action: () => handleClickMedia(MEDIA_LIBRARY_TYPE.IMAGE),
    },
    {
      icon: createElement(Icon, { path: mdiPlayCircle, size: 1.5 }),
      name: t("magneto.card.type.video"),
      action: () => handleClickMedia(MEDIA_LIBRARY_TYPE.VIDEO),
    },
    {
      icon: createElement(Icon, { path: mdiMusicNote, size: 1.5 }),
      name: t("magneto.card.type.audio"),
      action: () => handleClickMedia(MEDIA_LIBRARY_TYPE.AUDIO),
    },
    {
      icon: createElement(Icon, { path: mdiFileMultiple, size: 1.5 }),
      name: t("magneto.card.type.file"),
      action: () => handleClickMedia(MEDIA_LIBRARY_TYPE.ATTACHMENT),
    },
    {
      icon: createElement(Icon, { path: mdiLink, size: 1.5 }),
      name: t("magneto.card.type.link"),
      action: () => handleClickMedia(MEDIA_LIBRARY_TYPE.HYPERLINK),
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
