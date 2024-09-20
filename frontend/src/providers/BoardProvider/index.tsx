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
import { fetchZoomPreference, updateZoomPreference } from "./utils";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetBoardDataQuery } from "~/services/api/boardData.service";
import { RightRole } from "edifice-ts-client";
import { checkUserRight } from "@edifice-ui/react";

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
  const { data: boardData, isLoading } = useGetBoardDataQuery(id);
  const [boardRights, setBoardRights] = useState<Record<
    RightRole,
    boolean
  > | null>(null);

  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };

  const board = boardData
    ? new Board().build(boardData as IBoardItemResponse)
    : new Board();

  const prepareZoom = async () => {
    const zoom = await fetchZoomPreference();
    setZoomLevel(zoom);
  };

  const updateRights = async (rights: any) => {
    setBoardRights(await checkUserRight(rights));
  };

  useEffect(() => {
    prepareZoom();
  }, []);

  useEffect(() => {
    updateZoomPreference(zoomLevel);
  }, [zoomLevel]);

  useEffect(() => {
    if (boardData) updateRights(boardData.rights);
  }, [boardData]);

  const value = useMemo<BoardContextType>(
    () => ({
      board,
      zoomLevel,
      setZoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      isLoading,
      boardRights,
    }),
    [board, zoomLevel, boardRights],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
