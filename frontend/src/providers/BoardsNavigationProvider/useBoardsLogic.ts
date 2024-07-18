import { useState, useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { BoardObjectState, TriggerFetchState } from "./types";
import { initialBoardObject, initialTriggerFetch } from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { useFoldersNavigation } from "../FoldersNavigationProvider";

export const useBoardsLogic = () => {
  const { t } = useTranslation("magneto");
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardObject, setBoardObject] =
    useState<BoardObjectState>(initialBoardObject);
  const [triggerFetch, setTriggerFetch]  =
    useState<TriggerFetchState>(initialTriggerFetch);
  const { myBoards, myAllBoards } = triggerFetch;

//   const [boardObject, setBoardObject] =
//     useState<BoardObjectState>(initialBoardObject);
//   const [triggerFetch, setTriggerFetch]  =
//     useState<TriggerFetchState>(initialTriggerFetch);
//   const { myBoards, myAllBoards } = triggerFetch;
  const { currentFolder } = useFoldersNavigation();

  const processBoards = useCallback( //process board list
    (
      result: IBoardItemResponse[] | undefined,
      boardType: FOLDER_TYPE,
      title: string,
    ) => {
      if (result) {
        const preparedBoards = result.map((item) => new Board().build(item));
        const boardObject = new FolderTreeNavItem({
          id: boardType,
          title: t(title),
          parentId: "",
          section: true,
        }).buildBoards(preparedBoards);

        setBoards((prevBoards) => [...prevBoards, ...preparedBoards]);

        setBoardObject((prevBoardObject) => ({
          ...prevBoardObject,
          [boardType === FOLDER_TYPE.MY_BOARDS
            ? "myBoardObject"
            : "deletedBoardObject"]: boardObject,
        }));
      }
    },
    [],
  );

  const { data: myBoardsResult } = useGetBoardsQuery(
    {
      isPublic: false,
      isShared: true,
      isDeleted: false,
      sortBy: "modificationDate",
    }, 
    {
    skip: !myBoards,
    }
  );

  const { data: myAllBoardsResult } = useGetBoardsQuery(
    {
      isPublic: false,
      isShared: true,
      isDeleted: false,
      sortBy: "modificationDate",
    }, 
    {
      skip: !myAllBoards,
    }
  );

  const getBoards = useCallback(() => {
    setBoards([]);
    setTriggerFetch({ myBoards: true, myAllBoards: true });
  }, []);

  useEffect(() => {
    if (myBoards && myBoardsResult) {
      processBoards(
        myBoardsResult,
        FOLDER_TYPE.MY_BOARDS,
        "magneto.my.boards",
      );
      setTriggerFetch({ ...triggerFetch, myBoards: false });
    }
  }, [myBoards, myBoardsResult, processBoards, triggerFetch]);

  useEffect(() => {
    if (myAllBoards && myAllBoardsResult) {
      processBoards(
        myAllBoardsResult,
        FOLDER_TYPE.DELETED_BOARDS,
        "magneto.trash",
      );
      setTriggerFetch({ ...triggerFetch, myAllBoards: false });
    }
  }, [myAllBoards, myAllBoardsResult, processBoards, triggerFetch]);

  return { boards, boardObject, getBoards, setBoards };
};
     