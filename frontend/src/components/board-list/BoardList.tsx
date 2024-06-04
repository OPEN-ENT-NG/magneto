import React, { useEffect, useState } from "react";
import { useDrag } from 'react-dnd';

import { Card, useOdeClient, Tooltip } from "@edifice-ui/react";
import {
  mdiAccountCircle,
  mdiCalendarBlank,
  mdiCrown,
  mdiEarth,
  mdiMagnet,
  mdiShareVariant,
} from "@mdi/js";
import { Icon } from "@mdi/react";
import { animated, useSpring } from "@react-spring/web";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import "./BoardList.scss";
import { BoardItem } from "~/components/board-item/BoardItem";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import {
  Board,
  IBoardItemResponse,
  IBoardsParamsRequest,
} from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import { useGetBoardsQuery } from "~/services/api/boards.service";

type BoardListProps = {
  currentFolder: Folder;
  boardIds: String[];
  selectedBoards: Board[];
  setBoardIds: React.Dispatch<React.SetStateAction<String[]>>;
  setSelectedBoards: React.Dispatch<React.SetStateAction<Board[]>>;
};

// const boardData = {id, title, imageUrl, backgroundUrl, description, cardIds, sections, layoutType, tags, 
//   tagsTextInput, nbCards, nbCardsSections, modificationDate, creationDate, folderId, isPublished, owner, shared, 
//   deleted, canComment, displayNbFavorites };

export const BoardList: React.FunctionComponent<BoardListProps> = ({
  currentFolder,
  boardIds,
  selectedBoards,
  setBoardIds,
  setSelectedBoards,
}) => {
  const { user } = useOdeClient();

  let boardData;
  const [boardsQuery, setBoardsQuery] = useState<IBoardsParamsRequest>({
    isPublic: false,
    isShared: true,
    isDeleted: false,
    sortBy: "modificationDate",
  });

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });


  useEffect(() => {
    if (
      !currentFolder.id ||
      currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
      currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS ||
      currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
      currentFolder.id == ""
    ) {
      setBoardsQuery((prevBoardsQuery) => ({
        ...prevBoardsQuery,
        folderId: undefined,
        isPublic: !!currentFolder.isPublic,
        isDeleted: !!currentFolder.deleted,
      }));
    } else if (!!currentFolder && !!currentFolder.id) {
      setBoardsQuery((prevBoardsQuery) => ({
        ...prevBoardsQuery,
        folderId: currentFolder.id,
        isPublic: !!currentFolder.isPublic,
        isDeleted: !!currentFolder.deleted,
      }));
    } else {
      console.log("currentFolder undefined, try later or again");
    }
  }, [currentFolder]);

  const {
    data: myBoardsResult,
    isLoading: getBoardsLoading,
    error: getBoardsError,
  } = useGetBoardsQuery(boardsQuery) || {};
  if (getBoardsError) {
    console.log("error");
  } else if (getBoardsLoading) {
    console.log("loading");
  } else {
    boardData = myBoardsResult.all.map((board: IBoardItemResponse) =>
      new Board().build(board),
    ); //convert boards to Board[]
  }

  async function toggleSelect(resource: Board) {
    if (boardIds.includes(resource.id)) {
      setBoardIds(
        boardIds.filter(
          (selectedResource: String) => selectedResource !== resource.id,
        ),
      );
      setSelectedBoards(
        selectedBoards.filter(
          (selectedResource) => selectedResource.id !== resource.id,
        ),
      );
      return;
    }
    setBoardIds([...boardIds, resource.id]);
    setSelectedBoards([...selectedBoards, resource]);
  }

  return (
    <>
      {boardData?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {boardData.map((board: Board) => {
            const {
              id,
              title,
              imageUrl,
              nbCards,
              shared,
              owner,
              modificationDate,
              isPublished,
            } = board;
            return (
              <animated.li
                className="g-col-4 z-1 boardSizing"
                key={id}
                style={{
                  position: "relative",
                  ...springs,
                }} 
              >
                <BoardItem board={board} areBoardsLoading={getBoardsLoading} />
              </animated.li>
            );
          })}
        </animated.ul>
      ) : null}
    </>
  );
};
