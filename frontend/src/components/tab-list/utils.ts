import { CodeRounded } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import { useTranslation } from "react-i18next";

import { CURRENTTAB_STATE, TabConfig } from "./types";

export function useTabs(tabsConfig: TabConfig[]) {
  const { t } = useTranslation("magneto");

  return tabsConfig.map(({ tabValue, translationKey, icon }) => ({
    tabValue,
    label: t(translationKey),
    icon,
  }));
}

export const DEFAULT_TABS_CONFIG: TabConfig[] = [
  {
    tabValue: CURRENTTAB_STATE.MINE,
    translationKey: "magneto.cards.collection.mine",
  },
  {
    tabValue: CURRENTTAB_STATE.SHARED,
    translationKey: "magneto.cards.collection.shared",
  },
  {
    tabValue: CURRENTTAB_STATE.PUBLIC,
    translationKey: "magneto.cards.collection.public",
  },
  {
    tabValue: CURRENTTAB_STATE.FAVORTIE,
    translationKey: "magneto.cards.collection.favorite",
  },
];

export const BOARD_TABS_CONFIG: TabConfig[] = [
  {
    tabValue: CURRENTTAB_STATE.MINE,
    translationKey: "magneto.my.boards",
  },
  {
    tabValue: CURRENTTAB_STATE.SHARED,
    translationKey: "magneto.shared.boards",
  },
  {
    tabValue: CURRENTTAB_STATE.PUBLIC,
    translationKey: "magneto.lycee.connecte.boards",
  },
];

export const EXPORT_TABS_CONFIG: TabConfig[] = [
  {
    tabValue: CURRENTTAB_STATE.EXPORT_PPTX,
    translationKey: "magneto.download",
    icon: DownloadIcon,
  },
  {
    tabValue: CURRENTTAB_STATE.EXPORT_IFRAME,
    translationKey: "magneto.embed",
    icon: CodeRounded,
  },
];
