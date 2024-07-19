import {
  Board,
  IBoardItemResponse,
  IBoardsResponse,
} from "~/models/board.model";

export const prepareBoardsState = (myBoardResponse: IBoardsResponse) => {
  return myBoardResponse.all.map((board: IBoardItemResponse) =>
    new Board().build(board),
  ); //convert boards to Board[]
};
