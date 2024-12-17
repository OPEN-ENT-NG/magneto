import { FC, SyntheticEvent } from "react";

import Tabs from "@mui/material/Tabs";

import { StyledTab, tabsStyle } from "./style";
import { CURRENTTAB_STATE, TabListProps } from "./types";
import { DEFAULT_TABS_CONFIG, useTabs } from "./utils";

export const TabList: FC<TabListProps> = ({
  currentTab,
  onChange,
  tabsConfig = DEFAULT_TABS_CONFIG,
}) => {
  const handleChange = (event: SyntheticEvent, newValue: CURRENTTAB_STATE) => {
    onChange(newValue);
  };

  const tabs = useTabs(tabsConfig);

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
