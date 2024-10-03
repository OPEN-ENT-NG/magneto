import { FC } from "react";

import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";

import {
  listItemIconStyle,
  listItemTextStyle,
  menuItemStyle,
  menuStyle,
} from "./style";
import { DropDownListItem, DropDownListProps } from "./types";
import { getAnchorOrigin, getTransformOrigin } from "./utils";

export const DropDownList: FC<DropDownListProps> = ({
  items,
  onClose,
  open,
  anchorEl,
  position = "bottom-right",
  menuOffset = 8,
}) => {
  const handleItemClick = (item: DropDownListItem) => {
    item.OnClick();
    onClose();
  };
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
          <MenuItem onClick={() => handleItemClick(item)} sx={menuItemStyle}>
            <ListItemIcon sx={listItemIconStyle}>{item.primary}</ListItemIcon>
            <ListItemText primary={item.secondary} sx={listItemTextStyle} />
          </MenuItem>
        </Box>
      ))}
    </Menu>
  );
};
