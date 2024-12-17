import { CURRENTTAB_STATE } from "../tab-list/types";

export interface BoardCreateMagnetBoardModalProps {
  open: boolean;
  onClose: () => void;
}

export interface InputValueState {
  search: string;
  currentTab: CURRENTTAB_STATE;
  boardIds: string[];
}

export interface BoardCardWrapperProps {
  isCardSelected: boolean;
}
