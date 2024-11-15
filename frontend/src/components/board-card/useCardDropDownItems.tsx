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
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const useCardDropDownItems = (
  readOnly: boolean,
  isLocked: boolean,
  lockOrUnlockMagnet: () => void,
  card: Card,
  lockedAndNoRights?: boolean,
): DropDownListItem[] => {
  const { t } = useTranslation("magneto");
  const { openCardPreview } = useBoard();

  const icons = useMemo(
    () => ({
      play: <Icon path={mdiPlay} size="inherit" />,
      pencil: <Icon path={mdiPencil} size="inherit" />,
      fileMultiple: <Icon path={mdiFileMultipleOutline} size="inherit" />,
      bookArrow: <Icon path={mdiBookArrowRight} size="inherit" />,
      lock: <Icon path={mdiLock} size="inherit" />,
      delete: <Icon path={mdiDelete} size="inherit" />,
    }),
    [],
  );

  const handlers = useMemo(
    () => ({
      preview: () => openCardPreview(card),
      duplicate: () => null,
      edit: () => null,
      move: () => null,
      delete: () => null,
      lock: lockOrUnlockMagnet,
    }),
    [openCardPreview, lockOrUnlockMagnet, card],
  );

  const labels = useMemo(
    () => ({
      preview: t("magneto.card.options.preview"),
      duplicate: t("magneto.duplicate"),
      edit: t("magneto.card.options.edit"),
      move: t("magneto.card.options.move"),
      delete: t("magneto.card.options.delete"),
      lock: isLocked
        ? t("magneto.card.options.unlock")
        : t("magneto.card.options.lock"),
    }),
    [t, isLocked],
  );

  const menuItems = useMemo(
    () => ({
      preview: {
        primary: icons.play,
        secondary: labels.preview,
        OnClick: handlers.preview,
      },
      duplicate: {
        primary: icons.fileMultiple,
        secondary: labels.duplicate,
        OnClick: handlers.duplicate,
      },
      edit: {
        primary: icons.pencil,
        secondary: labels.edit,
        OnClick: handlers.edit,
      },
      move: {
        primary: icons.bookArrow,
        secondary: labels.move,
        OnClick: handlers.move,
      },
      lock: {
        primary: icons.lock,
        secondary: labels.lock,
        OnClick: handlers.lock,
      },
      delete: {
        primary: icons.delete,
        secondary: labels.delete,
        OnClick: handlers.delete,
      },
    }),
    [icons, labels, handlers],
  );

  return useMemo(() => {
    if (lockedAndNoRights) return [menuItems.preview];
    if (readOnly) return [menuItems.preview, menuItems.duplicate];
    return [
      menuItems.preview,
      menuItems.duplicate,
      menuItems.edit,
      menuItems.move,
      menuItems.lock,
      menuItems.delete,
    ];
  }, [lockedAndNoRights, readOnly, menuItems]);
};
