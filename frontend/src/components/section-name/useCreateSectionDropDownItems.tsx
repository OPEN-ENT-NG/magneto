import { Dispatch, SetStateAction } from "react";

import { useToast } from "@edifice.io/react";
import { mdiEyeOff, mdiFileMultipleOutline, mdiDelete, mdiEye } from "@mdi/js";
import Icon from "@mdi/react";
import { useTranslation } from "react-i18next";

import { DropDownListItem } from "../drop-down-list/types";
import { useBoard } from "~/providers/BoardProvider";
import { Section } from "~/providers/BoardProvider/types";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import {
  useDuplicateSectionMutation,
  useUpdateSectionMutation,
} from "~/services/api/sections.service";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";

export const useCreateSectionDropDownItems: (
  section: Section | null | undefined,
  setToggleModal: Dispatch<SetStateAction<boolean>>,
) => DropDownListItem[] = (section, setToggleModal) => {
  const { t } = useTranslation("magneto");
  const toast = useToast();
  const [duplicate] = useDuplicateSectionMutation();
  const [update] = useUpdateSectionMutation();
  const { sendMessage, readyState } = useWebSocketMagneto();

  const { hasManageRights } = useBoard();

  if (!section) return [];

  const { boardId, _id, cardIds } = section;
  const displayed = section.displayed ?? true;

  const duplicateSection = async () => {
    if (!boardId || !_id) return;
    const payload = {
      boardId,
      sectionIds: [_id],
    };
    try {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.SECTION_DUPLICATED,
            ...payload,
          }),
        );
      } else {
        await duplicate(payload);
      }
      toast.success(t("magneto.duplicate.section.confirm"));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDisplay = async () => {
    if (!boardId || !_id) return;

    const payload = {
      cardIds,
      boardId: boardId,
      id: _id,
      displayed: !displayed,
    };

    try {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.SECTION_UPDATED,
            section: payload,
          }),
        );
      } else {
        await update(payload);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleModal = () => {
    setToggleModal(true);
  };

  const displayItem = displayed
    ? {
        primary: <Icon path={mdiEyeOff} size={"inherit"} />,
        secondary: t("magneto.card.options.hide.section.off"),
        OnClick: toggleDisplay,
      }
    : {
        primary: <Icon path={mdiEye} size={"inherit"} />,
        secondary: t("magneto.card.options.hide.section.on"),
        OnClick: toggleDisplay,
      };

  const items: DropDownListItem[] = [];

  items.push({
    primary: <Icon path={mdiFileMultipleOutline} size={"inherit"} />,
    secondary: t("magneto.duplicate"),
    OnClick: duplicateSection,
  });

  if (hasManageRights()) {
    items.push(displayItem);
    items.push({
      primary: <Icon path={mdiDelete} size={"inherit"} />,
      secondary: t("magneto.delete"),
      OnClick: toggleModal,
    });
  }

  return items;
};
