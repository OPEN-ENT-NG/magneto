import { mdiEyeOff, mdiFileMultipleOutline, mdiDelete } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { DropDownListItem } from "../drop-down-list/types";

export const useCreateSectionDropDownItems: () => DropDownListItem[] = () => {
  const { t } = useTranslation("magneto");
  return [
    {
      primary: <Icon path={mdiFileMultipleOutline} size={"inherit"} />,
      secondary: t("magneto.duplicate"),
      OnClick: () => null,
    },
    {
      primary: <Icon path={mdiEyeOff} size={"inherit"} />,
      secondary: t("magneto.card.options.hide.section.off"),
      OnClick: () => null,
    },
    {
      primary: <Icon path={mdiDelete} size={"inherit"} />,
      secondary: t("magneto.delete"),
      OnClick: () => null,
    },
  ];
};
