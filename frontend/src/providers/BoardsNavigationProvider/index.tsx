import {
  FC,
  createContext,
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
import { Board, IBoardsParamsRequest } from "~/models/board.model";
import { useFoldersNavigation } from "../FoldersNavigationProvider";
import { useGetAllBoardsQuery, useGetBoardsQuery } from "~/services/api/boards.service";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";

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
  console.log(currentFolder);
  const [boards, setBoards] = useState<Board[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [boardsQuery, setBoardsQuery] = useState<IBoardsParamsRequest>({
    isPublic: false,
    isShared: true,
    isDeleted: false,
    sortBy: "modificationDate",
  });
  const allBoardsQuery = {
    isPublic: false,
    isShared: true,
    isDeleted: false,
    sortBy: "modificationDate",
  };


  const { currentData: myBoardsResult } = useGetBoardsQuery(boardsQuery);
  const { currentData: myAllBoardsResult } = useGetAllBoardsQuery(allBoardsQuery);

  useEffect(() => {
    if (
      !currentFolder.id ||
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS ||
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      currentFolder.id == ""
    ) {
      setBoardsQuery((prevBoardsQuery: any) => ({
        ...prevBoardsQuery,
        folderId: undefined,
        isPublic: !!currentFolder.isPublic,
        isDeleted: !!currentFolder.deleted,
      }));
    } else if (!!currentFolder && !!currentFolder.id) {
      setBoardsQuery((prevBoardsQuery: any) => ({
        ...prevBoardsQuery,
        folderId: currentFolder.id,
        isPublic: !!currentFolder.isPublic,
        isDeleted: !!currentFolder.deleted,
      }));
    } else {
      console.log("currentFolder undefined, try later or again");
    }
  }, [currentFolder]);

  useEffect(() => {
    console.log(myBoardsResult);
    console.log(myAllBoardsResult);
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