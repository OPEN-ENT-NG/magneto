import { useEffect, useMemo, MouseEvent as ReactMouseEvent } from "react";

import { animated, useSpring } from "@react-spring/web";

import { BoardCardWrapper } from "./style";
import { InputValueState } from "./types";
import { BoardItemLight } from "../board-item-light/BoardItemLight";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { useGetAllBoardsQuery } from "~/services/api/boards.service";
import "./BoardList.scss";

export const useRenderContent = (
  inputValue: InputValueState,
  setInputValue: React.Dispatch<React.SetStateAction<InputValueState>>,
) => {
  const { search, currentTab, selectedBoard } = inputValue;
  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  console.log({
    isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
    isShared: currentTab === CURRENTTAB_STATE.SHARED,
    isExclusivelyShared: currentTab === CURRENTTAB_STATE.SHARED,
    searchText: search,
    isDeleted: false,
    sortBy: "modificationDate",
    page: 0,
  });

  const { data: myBoardsResult } = useGetAllBoardsQuery(
    {
      isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
      isShared: currentTab === CURRENTTAB_STATE.SHARED,
      isExclusivelyShared: currentTab === CURRENTTAB_STATE.SHARED,
      searchText: search,
      isDeleted: false,
      sortBy: "modificationDate",
      page: 0,
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const boards = useMemo(() => {
    return (
      myBoardsResult?.all?.map((board: IBoardItemResponse) =>
        new Board().build(board),
      ) || []
    );
  }, [myBoardsResult]);

  const isSelectable = (event: MouseEvent): boolean => {
    const element = event.target as Element;
    const isNonSelectable =
      element.closest(`[data-type="${POINTER_TYPES.NON_SELECTABLE}"]`) !== null;
    const dropdownOpen = document.querySelector('[data-dropdown-open="true"]');
    return !isNonSelectable && !dropdownOpen;
  };

  const updateSelectedMagnets = (
    event: ReactMouseEvent<HTMLDivElement>,
    board: Board,
  ) => {
    if (!isSelectable(event.nativeEvent)) {
      event.preventDefault();
      return;
    }

    setInputValue((prevState: InputValueState): InputValueState => {
      // Si le board cliqué est déjà sélectionné, on le désélectionne
      if (prevState.selectedBoard?.id === board.id) {
        return {
          ...prevState,
          selectedBoard: null,
        };
      }
      // Sinon, on sélectionne le nouveau board
      return {
        ...prevState,
        selectedBoard: board,
      };
    });
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!isSelectable(e)) {
        e.preventDefault();
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const isBoardSelected = (board: Board): boolean => {
    return selectedBoard?.id === board.id;
  };

  return (
    <div className="board-list-container">
      {boards?.length > 0 && (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {boards.map((board: Board) => {
            return (
              <animated.li
                className="z-1 boardSizing"
                key={board.id}
                style={{
                  position: "relative",
                  ...springs,
                }}
              >
                <BoardCardWrapper
                  isBoardSelected={isBoardSelected(board)}
                  onClick={(event) => {
                    updateSelectedMagnets(event, board);
                  }}
                >
                  <BoardItemLight board={board} />
                </BoardCardWrapper>
              </animated.li>
            );
          })}
        </animated.ul>
      )}
    </div>
  );
};
