import { SimplifiedBoard } from "./types";
import { Board } from "~/models/board.model";

export const prepareI18nByModalType = (isModalDuplicate: boolean) =>
  isModalDuplicate
    ? {
        title: "magneto.board.duplicate.move.title",
        label: "magneto.board.duplicate.move.text",
        button: "magneto.duplicate",
      }
    : {
        title: "magneto.board.move.title",
        label: "magneto.board.move.text",
        button: "magneto.move",
      };

export const boardQuery = {
  isPublic: false,
  isShared: true,
  isDeleted: false,
  sortBy: "modificationDate",
};

export const transformAndSortBoards = (boards: Board[]): SimplifiedBoard[] => {
  return boards
    .map((board) => ({
      name: board.title,
      id: board._id,
    }))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
};
