import { TriggerFetchBoardState } from "./types";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board, IBoardItemResponse, IBoardsResponse } from "~/models/board.model";
import { Folder } from "~/models/folder.model";


export const initialTriggerFetch: TriggerFetchBoardState = {
  myBoards: false,
  myAllBoards: false,
};

export const prepareBoardsState = (
  myBoardResponse: IBoardsResponse,
  currentFolder: Folder,
) => {
  let boardData = myBoardResponse.all.map((board: IBoardItemResponse) =>
    new Board().build(board),
  ); //convert boards to Board[]

  if (
    !currentFolder.id ||
    currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
    currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
    currentFolder.id == ""
  ) {
    return boardData.filter((board: Board) => !board.folderId);
  } else if (currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS) {
    return boardData.filter((board: Board) => board.isPublished);
  } else if (!!currentFolder && !!currentFolder.id) {
    return boardData.filter(
      (board: Board) => board.folderId == currentFolder.id,
    );
  }
  console.log("currentFolder undefined, try later or again");
  return [];
};
