import { Board } from "~/models/board.model";

export interface BoardListProps {
  onDragAndDrop: (board: Board) => void;
  searchText: string;
  boards: Board[];
  boardsLoading: boolean;
}
