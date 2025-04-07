import { SvgIconComponent } from "@mui/icons-material";

export interface Tab {
  tabValue: CURRENTTAB_STATE;
  label: string;
  icon?: SvgIconComponent;
}

export interface TabConfig {
  tabValue: CURRENTTAB_STATE;
  translationKey: string;
  icon?: SvgIconComponent;
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
  EXPORT_PPTX = "EXPORT_PPTX",
  EXPORT_IFRAME = "EXPORT_IFRAME",
}
