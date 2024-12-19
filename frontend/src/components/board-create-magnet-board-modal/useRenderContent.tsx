import { useEffect, useMemo, MouseEvent as ReactMouseEvent } from "react";

import { animated, useSpring } from "@react-spring/web";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("magneto");
  const { search, currentTab, selectedBoardId } = inputValue;
  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const { data: myBoardsResult } = useGetAllBoardsQuery({
    isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
    isShared: currentTab === CURRENTTAB_STATE.SHARED,
    isDeleted: false,
    sortBy: "modificationDate",
    page: 0,
  });

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
    boardId: string,
  ) => {
    if (!isSelectable(event.nativeEvent)) {
      event.preventDefault();
      return;
    }

    setInputValue((prevState: InputValueState): InputValueState => {
      // Si le board cliqué est déjà sélectionné, on le désélectionne
      if (prevState.selectedBoardId === boardId) {
        return {
          ...prevState,
          selectedBoardId: null,
        };
      }
      // Sinon, on sélectionne le nouveau board
      return {
        ...prevState,
        selectedBoardId: boardId,
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

  const isBoardSelected = (boardId: string): boolean => {
    return selectedBoardId === boardId;
  };

  return (
    <>
      {boards?.length > 0 && (
        <animated.ul className="grid ps-0 list-unstyled mb-24">
          {boards
            .filter((board: Board) => {
              if (search === "") {
                return board;
              }
            })
            .map((board: Board) => {
              const { id } = board;
              return (
                <animated.li
                  className="z-1 boardSizing"
                  key={id}
                  style={{
                    position: "relative",
                    ...springs,
                  }}
                >
                  <BoardCardWrapper
                    isBoardSelected={isBoardSelected(board.id)}
                    onClick={(event) => {
                      updateSelectedMagnets(event, board.id);
                    }}
                  >
                    <BoardItemLight board={board} />
                  </BoardCardWrapper>
                </animated.li>
              );
            })}
        </animated.ul>
      )}
    </>
  );
};
