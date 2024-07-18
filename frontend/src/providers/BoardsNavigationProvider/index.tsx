import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useTranslation } from "react-i18next";

import {
  BoardsNavigationContextType,
  BoardsNavigationProviderProps,
  TriggerFetchState,
} from "./types";
import {
  prepareBoardsState,
  initialTriggerFetch,
} from "./utils";
import { Board } from "~/models/board.model";
import { useFoldersNavigation } from "../FoldersNavigationProvider";
import { useGetAllBoardsQuery, useGetBoardsQuery } from "~/services/api/boards.service";

const BoardsNavigationContext = createContext<BoardsNavigationContextType | null>(null);

export const useBoardsNavigation = () => {
  const context = useContext(BoardsNavigationContext);
  if (!context) {
      throw new Error("useBoardsNavigation must be used within a BoardsNavigationProvider");
  }
  return context;
};

export const BoardsNavigationProvider: FC<BoardsNavigationProviderProps> = ({
  children,
}) => {
  const { currentFolder } = useFoldersNavigation();
  const [boardData, setBoardData] = useState<Board[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [triggerFetch, setTriggerFetch] = useState<TriggerFetchState>(initialTriggerFetch);

  const { t } = useTranslation("magneto");

  const { data: myBoardsResult } = useGetBoardsQuery(
    {
    isPublic: currentFolder.isPublic,
    isShared: !!currentFolder.shared && !!currentFolder.shared.length,
    isDeleted: currentFolder.deleted,
    sortBy: "modificationDate",
    }, 
    {
      skip: !triggerFetch.myBoards,
    }
  );

  const { data: myAllBoardsResult } = useGetAllBoardsQuery(
    {
      isPublic: currentFolder.isPublic,
      isShared: !!currentFolder.shared && !!currentFolder.shared.length,
      isDeleted: currentFolder.deleted,
      sortBy: "modificationDate",
    }, 
    {
      skip: !triggerFetch.myAllBoards,
    }
  );

  const getBoards = useCallback(() => {
      setBoardData([]);
      setTriggerFetch({ myBoards: true, myAllBoards: true });
  }, []);

  useEffect(() => {
      if (triggerFetch.myBoards && myBoardsResult) {
          setTriggerFetch((prev) => ({ ...prev, myBoards: false }));
      }
  }, [triggerFetch.myBoards, myBoardsResult]);

  useEffect(() => {
      if (triggerFetch.myAllBoards && myAllBoardsResult) {
          setTriggerFetch((prev) => ({ ...prev, myAllBoards: false }));
      }
  }, [triggerFetch.myAllBoards, myAllBoardsResult]);

  useEffect(() => {
      getBoards();
  }, [currentFolder]);

  useEffect(() => {
      if (boardData.length && currentFolder)
          setBoards(prepareBoardsState(boardData, currentFolder));
  }, [boardData, currentFolder]);

  const value = useMemo<BoardsNavigationContextType>(
      () => ({
          boards,
          setBoards,
      }),
      [boards, setBoards]
  );

  return (
      <BoardsNavigationContext.Provider value={value}>
          {children}
      </BoardsNavigationContext.Provider>
  );
};