import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FC,
} from "react";

import { useToast } from "@edifice.io/react";
import { mdiEyeOff } from "@mdi/js";
import Icon from "@mdi/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, InputBase, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";

import { boxStyle, iconButtonStyle, iconStyle, inputStyle } from "./style";
import { SectionNameProps } from "./types";
import { useCreateSectionDropDownItems } from "./useCreateSectionDropDownItems";
import { DeleteSectionModal } from "../delete-section-modal/DeleteSectionModal";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../drop-down-list/useDropDown";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { useBoard } from "~/providers/BoardProvider";
import { useWebSocketMagneto } from "~/providers/WebsocketProvider";
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
} from "~/services/api/sections.service";

export const SectionName: FC<SectionNameProps> = ({ section }) => {
  const { sendMessage, readyState } = useWebSocketMagneto();
  const [inputValue, setInputValue] = useState<string>(section?.title ?? "");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const toast = useToast();
  const { t } = useTranslation("magneto");
  const { openDropdownId, registerDropdown, toggleDropdown, closeDropdown } =
    useDropdown();
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const {
    board: { id: boardId },
    hasEditRights,
  } = useBoard();
  const dropDownItemList = useCreateSectionDropDownItems(
    section,
    setIsDeleteModalOpen,
  );
  useEffect(() => {
    if (section?._id) {
      registerDropdown(section._id, dropdownRef.current);
    }
  }, [section?._id, registerDropdown]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    setInputValue(section?.title);
  }, [section?.title]);

  const updateSectionAndToast = usePredefinedToasts({
    func: updateSection,
    successMessage: t("magneto.update.section.confirm"),
    failureMessage: t("magneto.update.section.error"),
  });

  const createSectionAndToast = usePredefinedToasts({
    func: createSection,
    successMessage: t("magneto.create.section.confirm"),
    failureMessage: t("magneto.create.section.error"),
  });

  const handleKeyDownAndBlur = async () => {
    if (!inputValue) {
      setInputValue(section?.title ?? "");
      return toast.warning(t("magneto.change.section.empty.title"));
    }
    if (section?._id !== "new-section") {
      if (section.title === inputValue) return;
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.SECTION_UPDATED,
            section: {
              boardId,
              id: section?._id,
              title: inputValue,
              cardIds: section.cardIds,
            },
          }),
        );
        return;
      } else {
        return updateSectionAndToast({
          boardId,
          id: section?._id,
          title: inputValue,
          cardIds: section.cardIds,
        });
      }
    }
    try {
      if (readyState === WebSocket.OPEN) {
        sendMessage(
          JSON.stringify({
            type: WEBSOCKET_MESSAGE_TYPE.SECTION_ADDED,
            section: {
              boardId,
              title: inputValue,
            },
          }),
        );
      } else {
        await createSectionAndToast({
          boardId,
          title: inputValue,
        });
      }
      setInputValue("");
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const inputElement = inputWrapperRef.current?.querySelector("input");
      inputElement?.blur();
    }
  };

  const handleToggleDropdown = () => {
    if (section?._id) {
      toggleDropdown(section._id);
    }
  };

  const isOpen = openDropdownId === section?._id;

  return (
    <Box
      sx={boxStyle}
      ref={dropdownRef}
      data-dropdown-open={isOpen ? "true" : "false"}
    >
      {section?.displayed === false && (
        <Box sx={{ width: "1.5rem" }}>
          <Icon path={mdiEyeOff} size={"inherit"} />
        </Box>
      )}
      <InputBase
        data-type={DND_ITEM_TYPE.NON_DRAGGABLE}
        sx={inputStyle}
        value={inputValue}
        placeholder={
          section?._id === "new-section"
            ? t("magneto.section.insert.title")
            : ""
        }
        onChange={handleInputChange}
        onBlur={handleKeyDownAndBlur}
        onKeyDown={handleKeyDown}
        ref={inputWrapperRef}
        disabled={!hasEditRights()}
        fullWidth
      />
      {section._id !== "new-section" && hasEditRights() && (
        <IconButton
          size="large"
          sx={iconButtonStyle}
          onClick={handleToggleDropdown}
        >
          <MoreVertIcon sx={iconStyle} />
        </IconButton>
      )}
      {isOpen && dropdownRef.current && (
        <DropDownList
          items={dropDownItemList}
          onClose={closeDropdown}
          open={isOpen}
          anchorEl={dropdownRef.current}
        />
      )}
      {isDeleteModalOpen && section && (
        <DeleteSectionModal
          section={section}
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </Box>
  );
};
