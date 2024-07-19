import React from "react";

import { animated, useSpring } from "@react-spring/web";

import "./BoardList.scss";
import { BoardItem } from "~/components/board-item/BoardItem";
import { Board } from "~/models/board.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";

type BoardListProps = {
  selectedBoardIds: string[];
  selectedBoards: Board[];
  setSelectedBoardIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedBoards: React.Dispatch<React.SetStateAction<Board[]>>;
  onDragAndDrop: (board: Board) => void;
  searchText: string;
};

export const BoardList: React.FunctionComponent<BoardListProps> = ({
  selectedBoardIds,
  selectedBoards,
  setSelectedBoardIds,
  setSelectedBoards,
  onDragAndDrop,
  searchText,
}) => {
  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const { boards } = useBoardsNavigation();

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
