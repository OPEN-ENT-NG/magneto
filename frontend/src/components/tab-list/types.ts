export interface Tab {
  tabValue: CURRENTTAB_STATE;
  label: string;
}

export interface TabConfig {
  tabValue: CURRENTTAB_STATE;
  translationKey: string;
}

export interface TabListProps {
  currentTab: CURRENTTAB_STATE;
  onChange: (newValue: CURRENTTAB_STATE) => void;
  tabsConfig?: TabConfig[];
}

export enum CURRENTTAB_STATE {
  MINE = "MINE",
  SHARED = "SHARED",
  PUBLIC = "PUBLIC",
  FAVORTIE = "FAVORITE",
}
