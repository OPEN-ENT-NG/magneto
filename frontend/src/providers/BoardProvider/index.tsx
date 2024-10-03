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
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
// import { update } from "immutability-helper";

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
  // const [board, setBoard] = useState<Board>(
  //   boardData
  //     ? new Board().build(boardData as IBoardItemResponse)
  //     : new Board(),
  // );

  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };

  let board = boardData
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
    if (boardData && !isLoading) {
      updateRights(new Board().build(boardData as IBoardItemResponse).rights);
      setBoard(new Board().build(boardData as IBoardItemResponse));
    }
  }, [boardData]);

  const hasEditRights = (): boolean => {
    return board.owner.userId === user?.userId || !!boardRights?.manager;
  };

  //   const moveCard = useCallback((dragIndex: number, hoverIndex: number) => {
  //     const dragCard = board.sections[0].cardIds[dragIndex];
      // setBoard(update(board.cardIds, {
      //     $splice: [
      //         [dragIndex, 1],
      //         [hoverIndex, 0, dragCard],
      //     ],
      // }));
  // }, [cards]);

  const moveCardsHover = (
    dndCardId: string,
    draggedCardIndex: number,
    hoverIndex: number,
    dragSectionIndex?: number,
    dropSectionIndex?: number,
  ): void => {
    console.log(board);
    // let clonedBoard: Board = structuredClone(board);
    let clonedBoard: Board = board;
    if (board.layoutType === LAYOUT_TYPE.FREE) {
      // case free layout
      clonedBoard.cardIds.splice(draggedCardIndex, 1);
      clonedBoard.cardIds.splice(hoverIndex, 0, dndCardId);
      // setBoard(clonedBoard);
    } else if (dragSectionIndex !== undefined  && dropSectionIndex !== undefined && dragSectionIndex === dropSectionIndex) {
      // case d&d in same section
      clonedBoard.sections[dragSectionIndex].cardIds.splice(
        draggedCardIndex,
        1,
      );
      clonedBoard.sections[dragSectionIndex].cardIds.splice(
        hoverIndex,
        0,
        dndCardId,
      );
      // setBoard(clonedBoard);
    } else if (dragSectionIndex !== undefined  && dropSectionIndex !== undefined) {
      // case d&d in section != card initial section
      clonedBoard.sections[dragSectionIndex].cardIds.splice(
        draggedCardIndex,
        1,
      );
      clonedBoard.sections[dropSectionIndex].cardIds.splice(
        hoverIndex,
        0,
        dndCardId,
      );
      // setBoard(clonedBoard);
    } else {
      console.error("Target section is not defined")
    }
    //todo call to update board
    // setBoard(clonedBoard);
    console.log(board);
  };

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
      moveCardsHover,
    }),
    [board, zoomLevel, isLoading, boardRights],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
