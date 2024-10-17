import { Card } from "~/models/card.model";
import { CURRENTTAB_STATE } from "../tab-list/types";

export interface BoardCreateMagnetMagnetModalProps {
  open: boolean;
  onClose: () => void;
}

export interface InputValueState {
  search: string;
  currentTab: CURRENTTAB_STATE;
  isByBoards: boolean;
  isByFavorite: boolean;
  cardIds?: string[];
}
