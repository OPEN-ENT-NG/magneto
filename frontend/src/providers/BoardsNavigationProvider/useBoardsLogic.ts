import { useState, useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";

import { TriggerFetchState } from "./types";
import { initialTriggerFetch } from "./utils";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import { FolderTreeNavItem } from "~/models/folder-tree.model";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { useFoldersNavigation } from "../FoldersNavigationProvider";

export const useBoardsLogic = () => {
  const { t } = useTranslation("magneto");
  const [boards, setBoards] = useState<Board[]>([]);
  const [triggerFetch, setTriggerFetch]  =
    useState<TriggerFetchState>(initialTriggerFetch);
  const { myBoards, myAllBoards } = triggerFetch;
  const { currentFolder } = useFoldersNavigation();

  const processBoards = useCallback( //process board list
    (
      result: IBoardItemResponse[] | undefined,
      folderType: FOLDER_TYPE,
      title: string,
    ) => {
      if (result) {
        const preparedBoards = result.map((item) => new Board().build(item));

        setBoards((prevBoards) => [...prevBoards, ...preparedBoards]);
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

  return { boards, getBoards, setBoards };
};
     