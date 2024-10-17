import { useTranslation } from "react-i18next";

import { CURRENTTAB_STATE } from "./types";



export const useTabs = () => {
  const { t } = useTranslation("magneto");
  return [
    { tabValue: CURRENTTAB_STATE.MINE, label: t("magneto.cards.collection.mine") },
    { tabValue: CURRENTTAB_STATE.SHARED, label: t("magneto.cards.collection.shared") },
    { tabValue: CURRENTTAB_STATE.PUBLIC, label: t("magneto.cards.collection.public") },
    { tabValue: CURRENTTAB_STATE.FAVORTIE, label: t("magneto.cards.collection.favorite") },
  ];
};
