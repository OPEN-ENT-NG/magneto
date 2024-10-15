import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { checkUserRight, useOdeClient } from "@edifice-ui/react";
import { RightRole } from "edifice-ts-client";
import { useParams } from "react-router-dom";

import {
  BoardContextType,
  BoardProviderProps,
  DisplayModalsState,
} from "./types";
import {
  fetchZoomPreference,
  initialDisplayModals,
  updateZoomPreference,
} from "./utils";
import { BOARD_MODAL_TYPE } from "~/core/enums/board-modal-type";
import { Board, IBoardItemResponse } from "~/models/board.model";
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
  const [displayModals, setDisplayModals] =
    useState<DisplayModalsState>(initialDisplayModals);

  const { id = "" } = useParams();
  const { data: boardData, isLoading } = useGetBoardDataQuery(id);
  const [boardRights, setBoardRights] = useState<Record<
    RightRole,
    boolean
  > | null>(null);
  const { user } = useOdeClient();

  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };
console.log("alice board");

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
    console.log("useEffect", boardData);
    if (boardData && !isLoading) {
      updateRights(new Board().build(boardData as IBoardItemResponse).rights);
    }
  }, [boardData]);

  const hasEditRights = (): boolean => {
    return board.owner.userId === user?.userId || !!boardRights?.manager;
  };

  const toggleBoardModals = (modalType: BOARD_MODAL_TYPE) =>
    setDisplayModals((prevState) => ({
      ...prevState,
      [modalType]: !prevState[modalType],
    }));

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
      displayModals,
      toggleBoardModals,
    }),
    [board, zoomLevel, isLoading, boardRights, displayModals],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
