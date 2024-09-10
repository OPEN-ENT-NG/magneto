import { FC, createContext, useContext, useMemo, useState } from "react";

import { useParams } from "react-router-dom";

import { BoardContextType, BoardProviderProps } from "./types";
import { Board } from "~/models/board.model";
import { useGetBoardDataQuery } from "~/services/api/boardData.service";

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};

export const BoardProvider: FC<BoardProviderProps> = ({ children }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(3);

  const { id = "" } = useParams();
  const { data: board } = useGetBoardDataQuery(id);

  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };

  const value = useMemo<BoardContextType>(
    () => ({
      board: board || new Board(),
      zoomLevel,
      setZoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
    }),
    [board, zoomLevel],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
