import { t } from "i18next";

import { BoardObjectState, TriggerFetchState } from "./types";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board } from "~/models/board.model";
import { Folder } from "~/models/folder.model";


export const initialBoardObject: BoardObjectState = {
  myBoardObject: null,
  deletedBoardObject: null,
};

export const initialTriggerFetch: TriggerFetchState = {
  myBoards: false,
  deletedBoards: false,
};

export const prepareBoardsState = (
  boardData: Board[],
  currentFolder: Folder,
) => {
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
