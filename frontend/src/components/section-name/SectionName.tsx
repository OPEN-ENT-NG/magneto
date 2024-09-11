import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FC,
} from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, InputBase, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";

import { boxStyle, iconButtonStyle, iconStyle, inputStyle } from "./style";
import { useDropdown } from "./useDropDown";
import { useCreateSectionDropDownItems } from "./utils";
import { DropDownList } from "../drop-down-list/DropDownList";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { Section } from "~/providers/BoardProvider/types";
import {
  useCreateSectionMutation,
  useUpdateSectionMutation,
} from "~/services/api/sections.service";

interface SectionNameProps {
  section: Section | null;
  boardId: string;
}

export const SectionName: FC<SectionNameProps> = ({ section, boardId }) => {
  const [inputValue, setInputValue] = useState<string>(section?.title ?? "");
  const { t } = useTranslation("magneto");
  const dropDownItemList = useCreateSectionDropDownItems();
  const { openDropdownId, registerDropdown, toggleDropdown } = useDropdown();
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);

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
    if (section) {
      return updateSectionAndToast({
        boardId,
        id: section?._id,
        title: inputValue,
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
      {isOpen && (
        <DropDownList
          items={dropDownItemList}
          onClose={() => toggleDropdown(null)}
        />
      )}
    </Box>
  );
};
