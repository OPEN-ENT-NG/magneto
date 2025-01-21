import { SimplifiedBoard } from "./types";
import { Board, Boards } from "~/models/board.model";

export const prepareI18nByModalType = (isModalDuplicate: boolean) =>
  isModalDuplicate
    ? {
        title: "magneto.board.duplicate.move.title",
        label: "magneto.board.duplicate.move.text",
        button: "magneto.duplicate",
        error: "magneto.duplicate.cards.error",
        sucess: "magneto.duplicate.cards.confirm",
      }
    : {
        title: "magneto.board.move.title",
        label: "magneto.board.move.text",
        button: "magneto.move",
        error: "magneto.move.cards.error",
        sucess: "magneto.move.cards.confirm",
      };

const transformAndSortBoards = (boards: Board[]): SimplifiedBoard[] => {
  return boards
    .map((board) => ({
      name: board.title ?? "",
      id: board._id,
    }))
    .sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
};

export const prepareSortedBoards = (
  editableBoards: Boards | undefined,
  isModalDuplicate: boolean,
  currentBoardId: string,
) => {
  if (!editableBoards) return [];
  const rawSortedBoard = transformAndSortBoards(editableBoards.all);
  if (isModalDuplicate) return rawSortedBoard;
  return rawSortedBoard.filter((item) => item.id !== currentBoardId);
};
