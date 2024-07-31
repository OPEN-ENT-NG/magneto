import {
  Board,
  IBoardItemResponse,
  IBoardsResponse,
} from "~/models/board.model";

export const prepareBoardsState = (
  myBoardResponse: IBoardsResponse,
  isDeleted: boolean,
) => {
  console.log(myBoardResponse);
  return myBoardResponse.all.map((board: IBoardItemResponse) =>
    new Board().build({ ...board, deleted: isDeleted }),
  ); //convert boards to Board[]
};
