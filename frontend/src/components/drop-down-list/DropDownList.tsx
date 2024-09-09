import { FC, Fragment } from "react";

import { Box, Divider, List, ListItem } from "@mui/material";

import {
  DropdownListWrapper,
  listStyle,
  StyledListItemText,
  SVGWrapperStyle,
} from "./style";
import { DropDownListProps } from "./types";

export const DropDownList: FC<DropDownListProps> = ({ items, onClose }) => {
  const handleItemClick = (itemOnClick: () => void) => {
    itemOnClick();
    onClose();
  };

  return (
    <DropdownListWrapper>
      <List sx={listStyle}>
        {items.map((item, index) => (
          <Fragment key={`option-${index}`}>
            {item.divider && <Divider />}
            <ListItem onClick={() => handleItemClick(item.OnClick)}>
              <StyledListItemText
                primary={<Box sx={SVGWrapperStyle}>{item.primary}</Box>}
                secondary={item.secondary}
              />
            </ListItem>
          </Fragment>
        ))}
      </List>
    </DropdownListWrapper>
  );
};
