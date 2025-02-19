import { FC } from "react";

import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  listItemIconStyle,
  listItemTextStyle,
  menuItemStyle,
  menuStyle,
} from "./style";
import { DropDownListItem, DropDownListProps } from "./types";
import { getAnchorOrigin, getTransformOrigin } from "./utils";
import { Tooltip } from "../tooltip/Tooltip";

export const DropDownList: FC<DropDownListProps> = ({
  items,
  onClose,
  open,
  anchorEl,
  position = "bottom-right",
  menuOffset = 8,
}) => {
  const { t } = useTranslation("magneto");

  const handleItemClick = (item: DropDownListItem) => {
    item.OnClick();
    onClose();
  };

  const renderMenuItem = (item: DropDownListItem) => (
    <MenuItem
      onClick={() => handleItemClick(item)}
      sx={menuItemStyle}
      disabled={item.disabled}
    >
      <ListItemIcon sx={listItemIconStyle}>{item.primary}</ListItemIcon>
      <ListItemText primary={item.secondary} sx={listItemTextStyle} />
    </MenuItem>
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={getAnchorOrigin(position)}
      transformOrigin={getTransformOrigin(position, menuOffset)}
      sx={menuStyle}
      disableScrollLock
    >
      {items.map((item, index) => (
        <Box key={`option-${Date.now() + index}`}>
          {item.divider && <Divider />}

          {item.disabled && item.tooltip ? (
            <Tooltip title={t(item.tooltip)} arrow>
              <span>{renderMenuItem(item)}</span>
            </Tooltip>
          ) : (
            renderMenuItem(item)
          )}
        </Box>
      ))}
    </Menu>
  );
};
