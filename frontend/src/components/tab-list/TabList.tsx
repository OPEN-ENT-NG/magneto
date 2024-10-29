"use client";

import { FC, SyntheticEvent } from "react";

import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";

import { StyledTab, tabsStyle } from "./style";
import { CURRENTTAB_STATE, TabListProps } from "./types";
import { useTabs } from "./utils";

export const TabList: FC<TabListProps> = ({ currentTab, onChange }) => {
  const handleChange = (event: SyntheticEvent, newValue: CURRENTTAB_STATE) => {
    onChange(newValue);
  };

  const tabs = useTabs();

  return (
    <Tabs
      sx={tabsStyle}
      value={currentTab}
      onChange={handleChange}
      aria-label="basic tabs example"
    >
      {tabs.map((item) => (
        <StyledTab
          key={item.tabValue}
          label={item.label.toUpperCase()}
          value={item.tabValue}
        />
      ))}
    </Tabs>
  );
};
