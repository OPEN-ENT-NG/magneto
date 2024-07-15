import { Dispatch, ReactNode, SetStateAction } from "react";
import { Board } from "~/models/folder.model";

export interface ModalProviderProviderProps {
  children: ReactNode;
}

export type BoardListProviderContextType = {
  folders: Board[];
  setBoards: Dispatch<SetStateAction<Board[]>>;
};