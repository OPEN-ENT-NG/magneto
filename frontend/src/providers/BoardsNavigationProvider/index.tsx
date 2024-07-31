import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BoardsNavigationContextType,
  BoardsNavigationProviderProps,
} from "./types";
import { prepareBoardsState } from "./utils";
import { useFoldersNavigation } from "../FoldersNavigationProvider";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { Board, IBoardsParamsRequest } from "~/models/board.model";
import {
  useGetAllBoardsQuery,
  useGetBoardsQuery,
} from "~/services/api/boards.service";

const BoardsNavigationContext =
  createContext<BoardsNavigationContextType | null>(null);

export const useBoardsNavigation = () => {
  const context = useContext(BoardsNavigationContext);
  if (!context) {
    throw new Error(
      "useBoardsNavigation must be used within a BoardsNavigationProvider",
    );
  }
  return context;
};

export const BoardsNavigationProvider: FC<BoardsNavigationProviderProps> = ({
  children,
}) => {
  const { currentFolder } = useFoldersNavigation();
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoards, setSelectedBoards] = useState<Board[]>([]);
  const [selectedBoardsIds, setSelectedBoardsIds] = useState<string[]>([]);
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
  const { currentData: myAllBoardsResult } =
    useGetAllBoardsQuery(allBoardsQuery);

  function manageBoardsQueryParameters() {
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
  }

  const toggleSelect = useCallback(
    (resource: Board) => {
      if (selectedBoardsIds.includes(resource.id)) {
        setSelectedBoardsIds(
          selectedBoardsIds.filter(
            (selectedResource: string) => selectedResource !== resource.id,
          ),
        );
        setSelectedBoards(
          selectedBoards.filter(
            (selectedResource) => selectedResource.id !== resource.id,
          ),
        );
        return;
      }
      setSelectedBoardsIds([...selectedBoardsIds, resource.id]);
      setSelectedBoards([...selectedBoards, resource]);
    },
    [selectedBoards, selectedBoardsIds],
  );

  useEffect(() => {
    manageBoardsQueryParameters();
  }, [currentFolder]);

  useEffect(() => {
    if (!!myBoardsResult && !!currentFolder && searchText === "") {
      setBoards(prepareBoardsState(myBoardsResult, currentFolder.deleted));
    } else if (!!myAllBoardsResult && !!currentFolder && searchText !== "") {
      setBoards(prepareBoardsState(myAllBoardsResult, false));
    }
  }, [myBoardsResult, myAllBoardsResult, currentFolder]);

  const value = useMemo<BoardsNavigationContextType>(
    () => ({
      selectedBoards,
      setSelectedBoards,
      selectedBoardsIds,
      setSelectedBoardsIds,
      boards,
      setBoards,
      searchText,
      setSearchText,
      toggleSelect,
    }),
    [boards, searchText, selectedBoards, selectedBoardsIds, toggleSelect],
  );

  return (
    <BoardsNavigationContext.Provider value={value}>
      {children}
    </BoardsNavigationContext.Provider>
  );
};
