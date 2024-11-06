import { Dispatch, SetStateAction, useMemo } from "react";

import { mdiPencil, mdiDelete } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { DropDownListItem } from "../drop-down-list/types";

export const useCommentDropDownItems = (
  setIsEditing: Dispatch<SetStateAction<boolean>>,
): DropDownListItem[] => {
  const { t } = useTranslation("magneto");

  const dropdownItems: DropDownListItem[] = useMemo(
    () => [
      {
        primary: <Icon path={mdiPencil} size={"inherit"} />,
        secondary: t("magneto.card.options.edit"),
        OnClick: () => setIsEditing(true),
      },
      {
        primary: <Icon path={mdiDelete} size={"inherit"} />,
        secondary: t("magneto.card.options.delete"),
        OnClick: () => null,
      },
    ],
    [t, setIsEditing],
  );

  return useMemo(() => dropdownItems, [dropdownItems]);
};
