import React, { useState } from "react";

import { animated, useSpring } from "@react-spring/web";

import "./BoardList.scss";
import { isBoardInFilter } from "./utils";
import { BoardItem } from "~/components/board-item/BoardItem";
import { Board } from "~/models/board.model";
import { useBoardsNavigation } from "~/providers/BoardsNavigationProvider";
import { Loading } from "@edifice-ui/react";

type BoardListProps = {
  onDragAndDrop: (board: Board) => void;
  searchText: string;
};

export const BoardList: React.FunctionComponent<BoardListProps> = ({
  onDragAndDrop,
  searchText,
}) => {
  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const { boards, boardsLoading } = useBoardsNavigation();
  const [isBoardDragged, setIsBoardDragged] = useState<boolean>(false);

  return (
    <>
      {boardsLoading ? (
        <Loading isLoading loadingPosition="left">
          Loading...
        </Loading>
      ) : (
        boards?.length > 0 && (
          <animated.ul className="grid ps-0 list-unstyled mb-24">
            {boards
              .filter((board: Board) => {
                if (searchText === "") {
                  return board;
                } else if (isBoardInFilter(board, searchText)) {
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
                      onDragAndDropBoard={onDragAndDrop}
                      isBoardDragged={isBoardDragged}
                      setIsBoardDragged={setIsBoardDragged}
                    />
                  </animated.li>
                );
              })}
          </animated.ul>
        )
      )}
    </>
  );
};
