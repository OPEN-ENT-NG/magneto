import { CURRENTTAB_STATE } from "../tab-list/types";

export interface BoardCreateMagnetBoardModalProps {
  open: boolean;
  onClose: () => void;
}

export interface InputValueState {
  search: string;
  currentTab: CURRENTTAB_STATE;
  selectedBoardId: string | null;
}

export interface BoardCardWrapperProps {
  isBoardSelected: boolean;
}
