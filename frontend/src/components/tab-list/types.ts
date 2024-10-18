export interface TabListProps {
  currentTab: CURRENTTAB_STATE;
  onChange: (newValue: CURRENTTAB_STATE) => void;
}

export enum CURRENTTAB_STATE {
  MINE = "MINE",
  SHARED = "SHARED",
  PUBLIC = "PUBLIC",
  FAVORTIE = "FAVORITE",
}
