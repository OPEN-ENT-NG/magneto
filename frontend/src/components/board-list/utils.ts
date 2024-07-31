import { Board } from "~/models/board.model";

export const isBoardInFilter = (board: Board, searchText: string) => {
  if (
    board.title.toLowerCase().includes(searchText.toLowerCase()) ||
    (board.description != null &&
      board.description.toLowerCase().includes(searchText.toLowerCase()))
  )
    return true;
  if (board.tags == null || board.tags.length == 0) {
    return false;
  }
  return board.tags.some((tag) =>
    tag.toLowerCase().includes(searchText.toLowerCase()),
  );
};
