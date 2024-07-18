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
  TriggerFetchBoardState,
} from "./types";
import {
  prepareBoardsState,
  initialTriggerFetch,
} from "./utils";
import { Board } from "~/models/board.model";
import { useFoldersNavigation } from "../FoldersNavigationProvider";
import { useGetAllBoardsQuery, useGetBoardsQuery } from "~/services/api/boards.service";
import { S } from "vitest/dist/reporters-5f784f42.js";

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
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [triggerFetch, setTriggerFetch] = useState<TriggerFetchBoardState>(initialTriggerFetch);

  const { t } = useTranslation("magneto");

  const { data: myBoardsResult } = useGetBoardsQuery(
    {
    isPublic: !!currentFolder.isPublic,
    isShared: !!currentFolder.shared && !!currentFolder.shared.length,
    isDeleted: !!currentFolder.deleted,
    sortBy: "modificationDate",
    }, 
    {
      skip: !triggerFetch.myBoards,
    }
  );

  const { data: myAllBoardsResult } = useGetAllBoardsQuery(
    {
      isPublic: !!currentFolder.isPublic,
      isShared: !!currentFolder.shared && !!currentFolder.shared.length,
      isDeleted: !!currentFolder.deleted,
      sortBy: "modificationDate",
    }, 
    {
      skip: !triggerFetch.myAllBoards,
    }
  );

  const getBoards = useCallback(() => {
      setBoards([]);
      setTriggerFetch({ myBoards: true, myAllBoards: true });
  }, []);

  useEffect(() => {
      if (triggerFetch.myBoards && !!myBoardsResult && !!currentFolder && (searchText === "")) {
          setBoards(prepareBoardsState(myBoardsResult, currentFolder));
      }
      setTriggerFetch((prev) => ({ ...prev, myBoards: false }));
  }, [triggerFetch.myBoards, myBoardsResult]);

  useEffect(() => {
      if (triggerFetch.myAllBoards && !!myAllBoardsResult && !!currentFolder && (searchText !== "")) {
          //make request
          setBoards(prepareBoardsState(myAllBoardsResult, currentFolder));
      }
      setTriggerFetch((prev) => ({ ...prev, myAllBoards: false }));
  }, [triggerFetch.myAllBoards, myAllBoardsResult]);

  useEffect(() => {
      getBoards();
  }, [currentFolder]);


  const value = useMemo<BoardsNavigationContextType>(
      () => ({
          boards,
          setBoards,
          searchText,
          setSearchText
      }),
      [boards, setBoards, searchText, setSearchText]
  );

  return (
      <BoardsNavigationContext.Provider value={value}>
          {children}
      </BoardsNavigationContext.Provider>
  );
};