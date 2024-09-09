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
import { Section } from "~/providers/BoardProvider/types";

interface SectionNameProps {
  section: Section | null;
}

export const SectionName: FC<SectionNameProps> = ({ section }) => {
  const [inputValue, setInputValue] = useState<string>(section?.title ?? "");
  const { t } = useTranslation("magneto");
  const dropDownItemList = useCreateSectionDropDownItems();
  const { openDropdownId, registerDropdown, toggleDropdown } = useDropdown();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (section?._id) {
      registerDropdown(section._id, dropdownRef.current);
    }
  }, [section?._id, registerDropdown]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleBlur = () => {
    console.log("Input blurred:", inputValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      console.log("Enter pressed:", inputValue);
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
        placeholder={t("magneto.section.insert.title")}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        fullWidth
      />
      <IconButton
        size="large"
        sx={iconButtonStyle}
        onClick={handleToggleDropdown}
      >
        <MoreVertIcon sx={iconStyle} />
      </IconButton>
      {isOpen && (
        <DropDownList
          items={dropDownItemList}
          onClose={() => toggleDropdown(null)}
        />
      )}
    </Box>
  );
};
