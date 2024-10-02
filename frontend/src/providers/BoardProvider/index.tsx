import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { checkUserRight, useOdeClient } from "@edifice-ui/react";
import { RightRole } from "edifice-ts-client";
import { useParams } from "react-router-dom";

import { BoardContextType, BoardProviderProps } from "./types";
import { fetchZoomPreference, updateZoomPreference } from "./utils";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetBoardDataQuery } from "~/services/api/boardData.service";
import { update } from "immutability-helper";

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
  const { user } = useOdeClient();
  const [board, setBoard] = useState<Board>(boardData
    ? new Board().build(boardData as IBoardItemResponse)
    : new Board());

  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };

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
    if (boardData)
      updateRights(new Board().build(boardData as IBoardItemResponse).rights);
  }, [boardData]);

  const hasEditRights = (): boolean => {
    return board.owner.userId === user?.userId || !!boardRights?.manager;
  };

  const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
    const dragCard = board.sections[0].cardIds[dragIndex];
    setBoard(update(board.cardIds, {
        $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
        ],
    }));
}, [cards]);


  const moveCard = useCallback((
    dndCardId: string,
    draggedCardIndex: number,
    dropIndex: number,
    dragSectionIndex?: number,
    dropSectionIndex?: number,
  ): void => {
    if (!dragSectionIndex || !dropSectionIndex) {
      board.cardIds.splice(draggedCardIndex, 1);
      board.cardIds.splice(dropIndex, 0, dndCardId);
    } else if (
      dragSectionIndex === dropSectionIndex
    ) {
      board.sections[dragSectionIndex].cardIds.splice(draggedCardIndex, 1);
      board.sections[dragSectionIndex].cardIds.splice(
        dropIndex,
        0,
        dndCardId,
      );
    } else {
      board.sections[dragSectionIndex].cardIds.splice(draggedCardIndex, 1);
      board.sections[dropSectionIndex].cardIds.splice(
        dropIndex,
        0,
        dndCardId,
      );
    }
    //todo call to update board
    console.log(board);
  }, [board.cardIds, board.sections]);

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
      hasEditRights,
    }),
    [board, zoomLevel, isLoading, boardRights],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
