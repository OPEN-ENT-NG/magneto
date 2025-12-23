import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FC,
} from "react";

import { ColorPicker, HexaColor } from "@cgi-learning-hub/ui";
import { mdiEyeOff } from "@mdi/js";
import Icon from "@mdi/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, InputBase, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
  boxStyle,
  circlePickerStyle,
  ColorCircle,
  iconButtonStyle,
  iconStyle,
  inputStyle,
} from "./style";
import { SectionNameProps } from "./types";
import { useCreateSectionDropDownItems } from "./useCreateSectionDropDownItems";
import { DeleteSectionModal } from "../delete-section-modal/DeleteSectionModal";
import { DropDownList } from "../drop-down-list/DropDownList";
import { useDropdown } from "../drop-down-list/useDropDown";
import { PICKER_COLORS_OPTIONS } from "~/core/constants/picker-colors.const";
import { WEBSOCKET_MESSAGE_TYPE } from "~/core/enums/websocket-message-type";
import { DND_ITEM_TYPE } from "~/hooks/dnd-hooks/types";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { useTheme } from "~/hooks/useTheme";
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
  const [color, setColor] = useState<HexaColor>(section.color || "#FFFFFF");
  const { t } = useTranslation("magneto");
  const { isTheme1D } = useTheme();
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

  useEffect(() => {
    setColor(section.color || "#FFFFFF");
  }, [section.color]);

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
              color: color,
            },
          }),
        );
        toast.success(t("magneto.update.section.confirm"));
        return;
      } else {
        return updateSectionAndToast({
          boardId,
          id: section?._id,
          title: inputValue,
          cardIds: section.cardIds,
          color: color,
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

  const setColorAndUpdate = (value: HexaColor) => {
    setColor(value);

    if (readyState === WebSocket.OPEN) {
      sendMessage(
        JSON.stringify({
          type: WEBSOCKET_MESSAGE_TYPE.SECTION_UPDATED,
          section: {
            boardId,
            id: section?._id,
            title: inputValue,
            cardIds: section.cardIds,
            color: value,
          },
        }),
      );
    } else {
      updateSectionAndToast({
        boardId,
        id: section?._id,
        title: inputValue,
        cardIds: section.cardIds,
        color: value,
      });
    }
  };

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
      {section._id !== "new-section" &&
        (hasEditRights() ? (
          <ColorPicker
            value={color}
            onChange={setColorAndUpdate}
            useCheckmarkSwatch
            options={PICKER_COLORS_OPTIONS}
            slotProps={{
              circlePickerBox: {
                sx: circlePickerStyle,
              },
            }}
          />
        ) : (
          <ColorCircle color={color} />
        ))}
      <InputBase
        data-type={DND_ITEM_TYPE.NON_DRAGGABLE}
        sx={inputStyle(isTheme1D)}
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
