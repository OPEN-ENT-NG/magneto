import React, { useEffect, useState } from "react";

import { animated, useSpring } from "@react-spring/web";

import "./BoardList.scss";
import { BoardItem } from "~/components/board-item/BoardItem";
import { FOLDER_TYPE } from "~/core/enums/folder-type.enum";
import {
  Board,
  IBoardItemResponse,
  IBoardsParamsRequest,
} from "~/models/board.model";
import { Folder } from "~/models/folder.model";
import {
  useGetBoardsQuery,
  useGetAllBoardsQuery,
} from "~/services/api/boards.service";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";

type BoardListProps = {
  // boards: Board[];
  // setBoards: (boards: Board[]) => void;
  currentFolder: Folder;
  selectedBoardIds: string[];
  selectedBoards: Board[];
  setSelectedBoardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  onDragAndDrop: (board: Board) => void;
  searchText: string;
};

export const BoardList: React.FunctionComponent<BoardListProps> = ({
  // boards,
  // setBoards,
  currentFolder,
  selectedBoardIds,
  selectedBoards,
  setSelectedBoardIds,
  setSelectedBoards,
  onDragAndDrop,
  searchText,
}) => {
  // let boardData: Board[];
  // let allBoardData: Board[];
  // const [boardsQuery, setBoardsQuery] = useState<IBoardsParamsRequest>({
  //   isPublic: false,
  //   isShared: true,
  //   isDeleted: false,
  //   sortBy: "modificationDate",
  // });
  // const allBoardsQuery = {
  //   isPublic: false,
  //   isShared: true,
  //   isDeleted: false,
  //   sortBy: "modificationDate",
  // };

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const { boards, setBoards } = useBoardsNavigation();

  // useEffect(() => {
  //   if (
  //     !currentFolder.id ||
  //     currentFolder.id == FOLDER_TYPE.MY_BOARDS ||
  //     currentFolder.id == FOLDER_TYPE.PUBLIC_BOARDS ||
  //     currentFolder.id == FOLDER_TYPE.DELETED_BOARDS ||
  //     currentFolder.id == ""
  //   ) {
  //     setBoardsQuery((prevBoardsQuery) => ({
  //       ...prevBoardsQuery,
  //       folderId: undefined,
  //       isPublic: !!currentFolder.isPublic,
  //       isDeleted: !!currentFolder.deleted,
  //     }));
  //   } else if (!!currentFolder && !!currentFolder.id) {
  //     setBoardsQuery((prevBoardsQuery) => ({
  //       ...prevBoardsQuery,
  //       folderId: currentFolder.id,
  //       isPublic: !!currentFolder.isPublic,
  //       isDeleted: !!currentFolder.deleted,
  //     }));
  //   } else {
  //     console.log("currentFolder undefined, try later or again");
  //   }
  // }, [currentFolder]);

  // const {
  //   data: myBoardsResult,
  //   isLoading: getBoardsLoading,
  //   error: getBoardsError,
  // } = useGetBoardsQuery(boardsQuery) || {};
  // if (getBoardsError) {
  //   console.log("error");
  // } else if (getBoardsLoading) {
  //   console.log("loading");
  // } else {
  //   boardData = myBoardsResult.all.map((board: IBoardItemResponse) =>
  //     new Board().build(board),
  //   ); //convert boards to Board[]
  // }

  // const {
  //   data: myAllBoardsResult,
  //   isLoading: getAllBoardsLoading,
  //   error: getAllBoardsError,
  // } = useGetAllBoardsQuery(allBoardsQuery) || {};
  // if (getAllBoardsError) {
  //   console.log("error");
  // } else if (getAllBoardsLoading) {
  //   console.log("loading");
  // } else {
  //   allBoardData = myAllBoardsResult.all.map((board: IBoardItemResponse) =>
  //     new Board().build(board),
  //   ); //convert boards to Board[]
  // }

  async function toggleSelect(resource: Board) {
    if (selectedBoardIds.includes(resource.id)) {
      setSelectedBoardIds(
        selectedBoardIds.filter(
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
    setSelectedBoardIds([...selectedBoardIds, resource.id]);
    setSelectedBoards([...selectedBoards, resource]);
  }

  function isInFilter(board: Board) {
    if (
      board.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (board.description != null &&
        board.description.toLowerCase().includes(searchText.toLowerCase()))
    )
      return true;
    if (board.tags == null || board.tags.length == 0) {
      return false;
    }
    return board.tags.some((tag) =>
      tag.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  // useEffect(() => {
  //   setBoards(searchText !== "" ? allBoardData : boardData);
  // }, [searchText]);

  return (
    <>
      {boards?.length ? (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {boards
            .filter((board: Board) => {
              if (searchText === "") {
                return board;
              } else if (isInFilter(board)) {
                return board;
              }
            })
            .map((board: Board) => {
              const { id } = board;
              return (
                <animated.li
                  className="g-col-4 z-1 boardSizing"
                  key={id}
                  style={{
                    position: "relative",
                    ...springs,
                  }}
                >
                  <BoardItem
                    board={board}
                    selectedBoardIds={selectedBoardIds}
                    onDragAndDropBoard={onDragAndDrop}
                    onSelect={toggleSelect}
                  />
                </animated.li>
              );
            })}
        </animated.ul>
      ) : null}
    </>
  );
};
