import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import { BoardContextType, BoardProviderProps } from "./types";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { Board } from "~/models/board.model";
import { useGetBoardsByIdsQuery } from "~/services/api/boards.service";
import { useGetSectionsByBoardQuery } from "~/services/api/sections.service";

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};

export const BoardProvider: FC<BoardProviderProps> = ({ children }) => {
  const [board, setBoard] = useState<Board>(new Board());

  const { id = "" } = useParams();

  const { currentData: myBoardResult } = useGetBoardsByIdsQuery([id]);

  const { currentData: mySectionsResult } = useGetSectionsByBoardQuery(id);

  useEffect(() => {
    if (!!myBoardResult && !!mySectionsResult) {
      const boardResult = new Board().build(myBoardResult.all[0]);
      if (boardResult.layoutType != LAYOUT_TYPE.FREE) {
        boardResult.sections = mySectionsResult.all;
      }
      setBoard(boardResult);
    }
  }, [myBoardResult, mySectionsResult]);

  const value = useMemo<BoardContextType>(
    () => ({
      board,
      setBoard,
    }),
    [board],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
