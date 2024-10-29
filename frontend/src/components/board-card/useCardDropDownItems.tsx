import { useMemo } from "react";

import {
  mdiPlay,
  mdiPencil,
  mdiFileMultipleOutline,
  mdiBookArrowRight,
  mdiLock,
  mdiDelete,
} from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { DropDownListItem } from "../drop-down-list/types";

export const useCardDropDownItems = (readOnly: boolean): DropDownListItem[] => {
  const { t } = useTranslation("magneto");

  const readOnlyItems: DropDownListItem[] = useMemo(
    () => [
      {
        primary: <Icon path={mdiPlay} size={"inherit"} />,
        secondary: t("magneto.card.options.preview"),
        OnClick: () => null,
      },
      {
        primary: <Icon path={mdiFileMultipleOutline} size={"inherit"} />,
        secondary: t("magneto.duplicate"),
        OnClick: () => null,
      },
    ],
    [t],
  );

  const editableItems: DropDownListItem[] = useMemo(
    () => [
      ...readOnlyItems,
      {
        primary: <Icon path={mdiPencil} size={"inherit"} />,
        secondary: t("magneto.card.options.edit"),
        OnClick: () => null,
      },
      {
        primary: <Icon path={mdiBookArrowRight} size={"inherit"} />,
        secondary: t("magneto.card.options.move"),
        OnClick: () => null,
      },
      {
        primary: <Icon path={mdiLock} size={"inherit"} />,
        secondary: t("magneto.card.options.lock"),
        OnClick: () => null,
      },
      {
        primary: <Icon path={mdiDelete} size={"inherit"} />,
        secondary: t("magneto.card.options.delete"),
        OnClick: () => null,
      },
    ],
    [readOnlyItems, t],
  );

  return useMemo(
    () => (readOnly ? readOnlyItems : editableItems),
    [readOnly, readOnlyItems, editableItems],
  );
};
