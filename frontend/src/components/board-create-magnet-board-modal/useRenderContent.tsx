import { useEffect, useMemo, MouseEvent as ReactMouseEvent } from "react";

import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import { Box, Button, Grid, List, ListItem, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  BoardCardWrapper,
  boardTitleButton,
  boardTitleStyle,
  boardTitleWrapperStyle,
  listStyle,
} from "./style";
import { InputValueState } from "./types";
import BoardCard from "../board-card/BoardCard";
import { EmptyState } from "../empty-state/EmptyState";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { POINTER_TYPES } from "~/core/constants/pointerTypes.const";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { Card } from "~/models/card.model";
import {
  useDuplicateBoardMutation,
  useGetAllBoardsQuery,
} from "~/services/api/boards.service";

export const useRenderContent = (
  inputValue: InputValueState,
  setInputValue: React.Dispatch<React.SetStateAction<InputValueState>>,
) => {
  const { t } = useTranslation("magneto");
  const { search, currentTab } = inputValue;
  const zoomLevel = 2;
  const { data: myBoardsResult } = useGetAllBoardsQuery({
    isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
    isShared: currentTab === CURRENTTAB_STATE.SHARED,
    isDeleted: false,
    sortBy: "modificationDate",
    page: 0,
  });

  const [duplicateBoard] = useDuplicateBoardMutation();

  const duplicateBoardsAndToast = usePredefinedToasts({
    func: duplicateBoard,
    successMessage: t("magneto.duplicate.elements.confirm"),
    failureMessage: t("magneto.duplicate.elements.error"),
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
    cardId: string,
  ) => {
    if (!isSelectable(event.nativeEvent)) {
      event.preventDefault();
      return;
    }

    let updatedSelectedBoards = inputValue.boardIds;

    if (updatedSelectedBoards.find((magnetId: string) => magnetId == cardId)) {
      const index = updatedSelectedBoards.indexOf(cardId, 0);
      updatedSelectedBoards.splice(index, 1);
    } else {
      updatedSelectedBoards = [...updatedSelectedBoards, cardId];
    }
    setInputValue((prevState) => ({
      ...prevState,
      cardIds: updatedSelectedBoards,
    }));
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
    return !!inputValue.boardIds.find(
      (boardCardId: string) => boardCardId == boardId,
    );
  };

  if (isByBoards) {
    return isOneMagnetInBoards ? (
      <List sx={listStyle}>
        {boardsWithCards.map(
          (board: Board) =>
            !!board.cards.length && (
              <ListItem key={board._id}>
                <Box width={"100%"}>
                  <Box sx={boardTitleWrapperStyle}>
                    <Typography sx={boardTitleStyle}>{board._title}</Typography>
                    <Button
                      sx={boardTitleButton}
                      startIcon={<FileCopyOutlinedIcon />}
                      onClick={() => duplicateBoardsAndToast(board._id)}
                    >
                      {t("magneto.cards.collection.board.duplicate")}
                    </Button>
                  </Box>
                  <Grid container spacing={2} width="fit-content">
                    {board.cards.map((card) => (
                      <Grid item key={card.id}>
                        <BoardCardWrapper
                          isBoardSelected={isBoardSelected(card.id)}
                          onClick={(event) => {
                            updateSelectedMagnets(event, card.id);
                          }}
                        >
                          <BoardCard
                            card={card}
                            zoomLevel={zoomLevel}
                            readOnly={true}
                          />
                        </BoardCardWrapper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </ListItem>
            ),
        )}
      </List>
    ) : (
      <EmptyState title={t("magneto.cards.empty.text")} />
    );
  } else {
    return cardsData.length ? (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Grid container spacing={2} p={".5rem"}>
          {cardsData.map((card: Card) => (
            <Grid item key={card.id}>
              <BoardCardWrapper
                isBoardSelected={isBoardSelected(card.id)}
                onClick={(event) => {
                  updateSelectedMagnets(event, card.id);
                }}
              >
                <BoardCard card={card} zoomLevel={zoomLevel} readOnly={true} />
              </BoardCardWrapper>
            </Grid>
          ))}
        </Grid>
      </Box>
    ) : (
      <EmptyState title={t("magneto.cards.empty.text")} />
    );
  }
};
