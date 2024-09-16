import { FC, Fragment } from "react";

import {
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
import { DropDownListProps } from "./types";
import { getAnchorOrigin, getTransformOrigin } from "./utils";

export const DropDownList: FC<DropDownListProps> = ({
  items,
  onClose,
  open,
  anchorEl,
  position = "bottom-right",
  menuOffset = 8,
}) => {
  const handleItemClick = (itemOnClick: () => void) => {
    itemOnClick();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={getAnchorOrigin(position)}
      transformOrigin={getTransformOrigin(position,menuOffset)}
      sx={menuStyle}
    >
      {items.map((item, index) => (
        <Fragment key={`option-${Date.now() + index}`}>
          {item.divider && <Divider />}
          <MenuItem
            onClick={() => handleItemClick(item.OnClick)}
            sx={menuItemStyle}
          >
            <ListItemIcon sx={listItemIconStyle}>{item.primary}</ListItemIcon>
            <ListItemText primary={item.secondary} sx={listItemTextStyle} />
          </MenuItem>
        </Fragment>
      ))}
    </Menu>
  );
};
