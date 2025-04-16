import { createElement, FC, SyntheticEvent } from "react";

import { Tab, Tabs } from "@cgi-learning-hub/ui";

import {
  alternativeTabsStyle,
  alternativeTabStyle,
  tabsStyle,
  tabStyle,
} from "./style";
import { CURRENTTAB_STATE, TabListProps } from "./types";
import { DEFAULT_TABS_CONFIG, useTabs } from "./utils";

export const TabList: FC<TabListProps> = ({
  currentTab,
  onChange,
  tabsConfig = DEFAULT_TABS_CONFIG,
  variant = false,
}) => {
  const handleChange = (event: SyntheticEvent, newValue: CURRENTTAB_STATE) => {
    onChange(newValue);
  };

  const tabs = useTabs(tabsConfig);

  return (
    <Tabs
      sx={variant ? alternativeTabsStyle : tabsStyle}
      value={currentTab}
      onChange={handleChange}
      aria-label="basic tabs example"
      variant={variant ? "standard" : "scrollable"}
      scrollButtons="auto"
      allowScrollButtonsMobile={!variant} // Ensure scroll buttons appear on mobile too
    >
      {tabs.map((item) => (
        <Tab
          iconPosition="start"
          key={item.tabValue}
          label={variant ? item.label : item.label.toUpperCase()}
          value={item.tabValue}
          sx={variant ? alternativeTabStyle : tabStyle}
          icon={
            item.icon
              ? createElement(item.icon, { fontSize: "large" })
              : undefined
          }
        />
      ))}
    </Tabs>
  );
};
