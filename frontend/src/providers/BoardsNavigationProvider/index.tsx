import {
  FC,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { TreeViewHandlers } from "@edifice-ui/react";
import { useTranslation } from "react-i18next";


import {
  BoardNavigationRefs,
  BoardObjectState,
  BoardsNavigationContextType,
  BoardsNavigationProviderProps,
  TriggerFetchState,
} from "./types";
import {
  initialBoardObject,
  prepareBoardsState,
  initialTriggerFetch,
} from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
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
  const { currentFolder, setCurrentFolder } = useFoldersNavigation();
  const [boardData, setBoardData] = useState<Board[]>([]);
  const [boardObject, setBoardObject] = useState<BoardObjectState>(initialBoardObject);
  const [boards, setBoards] = useState<Board[]>([]);
  const [triggerFetch, setTriggerFetch] = useState<TriggerFetchState>(initialTriggerFetch);

  const myBoardsRef = useRef<TreeViewHandlers>(null);
  const publicBoardsRef = useRef<TreeViewHandlers>(null);
  const myAllBoardsRef = useRef<TreeViewHandlers>(null);
  const { t } = useTranslation("magneto");

  const folderNavigationRefs: BoardNavigationRefs = useMemo(
      () => ({
          [FOLDER_TYPE.MY_BOARDS]: myBoardsRef,
          [FOLDER_TYPE.PUBLIC_BOARDS]: publicBoardsRef,
          [FOLDER_TYPE.DELETED_BOARDS]: myAllBoardsRef,
      }),
      []
  );

  // const handleSelect = useCallback(
  //     (boardId: string, folderType: FOLDER_TYPE | "basicFolder") => {
  //         if (currentFolder.id === boardId) return;

  //         setCurrentFolder((prevFolder) => {
  //             if (prevFolder.id === boardId) return prevFolder;

  //             const newFolder = prepareFolder(
  //                 boardId,
  //                 boardData,
  //                 t(prepareFolderTitle(folderType)),
  //             );

  //             setTimeout(() => {
  //                 Object.entries(folderNavigationRefs).forEach(([type, ref]) => {
  //                     if (type === folderType) {
  //                         ref.current?.select(boardId);
  //                     } else {
  //                         ref.current?.unselectAll();
  //                     }
  //                 });
  //             }, 0);
  //             return newFolder;
  //         });
  //     },
  //     [currentFolder, boardData, folderNavigationRefs]
  // );


  // const processFolders = useCallback(
  //     (result: IFolderResponse[] | undefined, folderType: FOLDER_TYPE, title: string) => {
  //         if (result) {
  //             const preparedFolders = result.map((item) => new Folder().build(item));
  //             const boardObject = new FolderTreeNavItem({
  //                 id: folderType,
  //                 title: t(title),
  //                 parentId: "",
  //                 section: true,
  //             }).buildFolders(preparedFolders);

  //             setFolderData((prevFolderData) => [...prevFolderData, ...preparedFolders]);

  //             setFolderObject((prevFolderObject) => ({
  //                 ...prevFolderObject,
  //                 [folderType === FOLDER_TYPE.MY_BOARDS ? "myFolderObject" : "deletedFolderObject"]: boardObject,
  //             }));
  //         }
  //     },
  //     [t]
  // );

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
          currentFolder,
          setCurrentFolder,
          boardData,
          setBoardData,
          boardObject,
          setBoardObject,
          boards,
          setBoards,
          getBoards,
          handleSelect,
          folderNavigationRefs,
      }),
      [currentFolder, boardData, boardObject, boards, folderNavigationRefs, getBoards, handleSelect]
  );

  return (
      <BoardsNavigationContext.Provider value={value}>
          {children}
      </BoardsNavigationContext.Provider>
  );
};