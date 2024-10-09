import { InputValueState } from "./types";
import { CURRENTTAB_STATE } from "../tab-list/types";

export const initialInputvalue: InputValueState = {
  search: "",
  currentTab: CURRENTTAB_STATE.MINE,
  isByBoards: false,
  isByFavorite: false,
};
