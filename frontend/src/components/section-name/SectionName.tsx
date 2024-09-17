import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FC,
} from "react";

import { useToast } from "@edifice-ui/react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, InputBase, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";

import { boxStyle, iconButtonStyle, iconStyle, inputStyle } from "./style";
import { SectionNameProps } from "./types";
import { useDropdown } from "./useDropDown";
import { useCreateSectionDropDownItems } from "./utils";
import { DropDownList } from "../drop-down-list/DropDownList";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { useBoard } from "~/providers/BoardProvider";
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
} from "~/services/api/sections.service";

export const SectionName: FC<SectionNameProps> = ({ section }) => {
  const [inputValue, setInputValue] = useState<string>(section?.title ?? "");
  const toast = useToast();
  const { t } = useTranslation("magneto");
  const dropDownItemList = useCreateSectionDropDownItems();
  const { openDropdownId, registerDropdown, toggleDropdown } = useDropdown();
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const {
    board: { id: boardId },
  } = useBoard();

  useEffect(() => {
    if (section?._id) {
      registerDropdown(section._id, dropdownRef.current);
    }
  }, [section?._id, registerDropdown]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

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
    if (section) {
      return updateSectionAndToast({
        boardId,
        id: section?._id,
        title: inputValue,
        cardIds: section.cardIds,
      });
    }
    try {
      await createSectionAndToast({
        boardId,
        title: inputValue,
      });
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
    <Box sx={boxStyle} ref={dropdownRef}>
      <InputBase
        sx={inputStyle}
        value={inputValue}
        placeholder={section ? "" : t("magneto.section.insert.title")}
        onChange={handleInputChange}
        onBlur={handleKeyDownAndBlur}
        onKeyDown={handleKeyDown}
        ref={inputWrapperRef}
        fullWidth
      />
      {section && (
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
          onClose={() => toggleDropdown(null)}
          open={isOpen}
          anchorEl={dropdownRef.current}
        />
      )}
    </Box>
  );
};
