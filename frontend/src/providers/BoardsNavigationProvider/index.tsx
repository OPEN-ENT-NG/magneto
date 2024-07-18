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
} from "./types";
import {
  prepareBoardsState,
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
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  // const [triggerFetch, setTriggerFetch] = useState<TriggerFetchBoardState>(initialTriggerFetch);

  const { t } = useTranslation("magneto");

  const { currentData: myBoardsResult } = useGetBoardsQuery(
    {
    isPublic: !!currentFolder.isPublic,
    isShared: !!currentFolder.shared && !!currentFolder.shared.length,
    isDeleted: !!currentFolder.deleted,
    sortBy: "modificationDate",
    }
  );
  const { currentData: myAllBoardsResult } = useGetAllBoardsQuery(
    {
      isPublic: !!currentFolder.isPublic,
      isShared: !!currentFolder.shared && !!currentFolder.shared.length,
      isDeleted: !!currentFolder.deleted,
      sortBy: "modificationDate",
    }
  );

  useEffect(() => {
      if (!!myBoardsResult && !!currentFolder && (searchText === "")) {
        setBoards(prepareBoardsState(myBoardsResult, currentFolder));
      } else if (!!myAllBoardsResult && !!currentFolder && (searchText !== "")) {
        setBoards(prepareBoardsState(myAllBoardsResult, currentFolder));
      }
  }, [ myBoardsResult, myAllBoardsResult, currentFolder]);

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