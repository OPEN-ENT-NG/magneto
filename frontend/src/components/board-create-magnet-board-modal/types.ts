import { CURRENTTAB_STATE } from "../tab-list/types";
import { Board } from "~/models/board.model";

export interface BoardCreateMagnetBoardModalProps {
  open: boolean;
  onClose: () => void;
}

export interface InputValueState {
  search: string;
  currentTab: CURRENTTAB_STATE;
  selectedBoard: Board | null;
}

export interface BoardCardWrapperProps {
  isBoardSelected: boolean;
}
