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

export const useCardDropDownItems = (
  readOnly: boolean,
  lockedAndNoRights?: boolean,
): DropDownListItem[] => {
  const { t } = useTranslation("magneto");
  

  //put in boardCard
  const [updateCard] = useUpdateCardMutation();
  const lockOrUnlockMagnet = () => {
    const payload: CardPayload = {
      boardId: board._id,
      caption: caption,
      description: editorRef.current?.getContent("html") as string,
      locked: false,
      resourceId: media?.id ?? "",
      resourceType: magnetType ?? convertMediaTypeToResourceType(media?.type),
      resourceUrl: linkUrl ? linkUrl : media?.url ?? null,
      title: title,
      ...(section?._id ? { sectionId: section._id } : {}),
    };

    await updateCard()
  }

  const lockedAndNoRightsItems: DropDownListItem[] = useMemo(
    () => [
      {
        primary: <Icon path={mdiPlay} size={"inherit"} />,
        secondary: t("magneto.card.options.preview"),
        OnClick: () => null,
      },
    ],
    [t],
  );

  const readOnlyItems: DropDownListItem[] = useMemo(
    () => [
      ...lockedAndNoRightsItems,
      {
        primary: <Icon path={mdiFileMultipleOutline} size={"inherit"} />,
        secondary: t("magneto.duplicate"),
        OnClick: () => null,
      },
    ],
    [lockedAndNoRightsItems, t],
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
        OnClick: () => {},
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
    () =>
      lockedAndNoRights
        ? lockedAndNoRightsItems
        : readOnly
        ? readOnlyItems
        : editableItems,
    [readOnly, readOnlyItems, editableItems, lockedAndNoRights],
  );
};
