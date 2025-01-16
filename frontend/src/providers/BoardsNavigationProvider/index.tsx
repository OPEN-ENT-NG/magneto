import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { checkUserRight } from "@edifice-ui/react";
import { RightRole } from "edifice-ts-client";

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
  const [selectedBoardRights, setSelectedBoardRights] = useState<Record<
    RightRole,
    boolean
  > | null>(null);
  const [searchText, setSearchText] = useState<string>("");
  const [boardsLoading, setBoardsLoading] = useState<boolean>(true);
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

  const { currentData: myBoardsResult, isFetching: myBoardsLoading } =
    useGetBoardsQuery(boardsQuery, {
      refetchOnMountOrArgChange: true,
    });
  const { currentData: myAllBoardsResult } = useGetAllBoardsQuery(
    allBoardsQuery,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const updateRights = async () => {
    setSelectedBoardRights(await checkUserRight(selectedBoards[0].rights));
  };

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
    if (selectedBoards.length === 1) updateRights();
    else setSelectedBoardRights(null);
  }, [selectedBoards]);

  useEffect(() => {
    const manageBoardsQueryParameters = () => {
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
          allFolders: currentFolder.id === FOLDER_TYPE.PUBLIC_BOARDS,
        }));
      } else if (!!currentFolder && !!currentFolder.id) {
        setBoardsQuery((prevBoardsQuery: any) => ({
          ...prevBoardsQuery,
          folderId: currentFolder.id,
          isPublic: !!currentFolder.isPublic,
          isDeleted: !!currentFolder.deleted,
        }));
      } else {
        console.error("currentFolder undefined, try later or again");
      }
    };

    manageBoardsQueryParameters();
  }, [currentFolder]);

  useEffect(() => {
    if (!!myBoardsResult && !!currentFolder && searchText === "") {
      setBoards(prepareBoardsState(myBoardsResult, currentFolder.deleted));
    } else if (!!myAllBoardsResult && !!currentFolder && searchText !== "") {
      setBoards(prepareBoardsState(myAllBoardsResult, false));
    }
  }, [myBoardsResult, myAllBoardsResult, currentFolder, searchText]);

  useEffect(() => {
    setBoardsLoading(myBoardsLoading);
  }, [myBoardsLoading]);

  const value = useMemo<BoardsNavigationContextType>(
    () => ({
      selectedBoards,
      setSelectedBoards,
      selectedBoardsIds,
      setSelectedBoardsIds,
      boards,
      boardsLoading,
      setBoards,
      searchText,
      setSearchText,
      toggleSelect,
      selectedBoardRights,
      setSelectedBoardRights,
    }),
    [
      boards,
      searchText,
      selectedBoards,
      selectedBoardsIds,
      toggleSelect,
      boardsLoading,
      selectedBoardRights,
    ],
  );

  return (
    <BoardsNavigationContext.Provider value={value}>
      {children}
    </BoardsNavigationContext.Provider>
  );
};
