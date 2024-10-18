import { useMemo } from "react";

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
import { BoardCard } from "../board-card/BoardCard";
import { EmptyState } from "../empty-state/EmptyState";
import { CURRENTTAB_STATE } from "../tab-list/types";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { ICardItemResponse, Card } from "~/models/card.model";
import {
  useDuplicateBoardMutation,
  useGetAllBoardsQuery,
} from "~/services/api/boards.service";
import { useGetAllCardsCollectionQuery } from "~/services/api/cards.service";

export const useRenderContent = (
  inputValue: InputValueState,
  setInputValue: React.Dispatch<React.SetStateAction<InputValueState>>,
) => {
  const { t } = useTranslation("magneto");
  const { search, currentTab, isByBoards, isByFavorite } = inputValue;
  const zoomLevel = 2;
  const { data: myBoardsResult } = useGetAllBoardsQuery({
    isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
    isShared: currentTab === CURRENTTAB_STATE.SHARED,
    isDeleted: false,
    sortBy: isByFavorite ? "favorite" : "modificationDate",
    page: 0,
  });

  const { data: myCardsResult } = useGetAllCardsCollectionQuery({
    page: 0,
    sortBy: isByFavorite ? "favorite" : "modificationDate",
    searchText: search,
    isShared: currentTab === CURRENTTAB_STATE.SHARED,
    isPublic: currentTab === CURRENTTAB_STATE.PUBLIC,
    isFavorite: currentTab === CURRENTTAB_STATE.FAVORTIE,
  });
  const [duplicateBoard] = useDuplicateBoardMutation();

  const duplicateBoardsAndToast = usePredefinedToasts({
    func: duplicateBoard,
    successMessage: t("magneto.duplicate.elements.confirm"),
    failureMessage: t("magneto.duplicate.elements.error"),
  });

  const boardsWithCards = useMemo(() => {
    const boardData =
      myBoardsResult?.all?.map((board: IBoardItemResponse) =>
        new Board().build(board),
      ) || [];
    const cardsData =
      myCardsResult?.all?.map((card: ICardItemResponse) =>
        new Card().build(card),
      ) || [];

    return boardData.map((board: Board) => ({
      ...board,
      cards: cardsData.filter((card: Card) => card.boardId === board._id),
    }));
  }, [myBoardsResult, myCardsResult]);

  const cardsData =
    myCardsResult?.all?.map((card: ICardItemResponse) =>
      new Card().build(card),
    ) || [];

  const isOneMagnetInBoards = boardsWithCards.some(
    (item: Board) => !!item.cards.length,
  );

  const updateSelectedMagnets = (cardId: string) => {
    let updatedSelectedMagnets = inputValue.cardIds;
    if (updatedSelectedMagnets.find((magnetId: string) => magnetId == cardId)) {
      const index = updatedSelectedMagnets.indexOf(cardId, 0);
      updatedSelectedMagnets.splice(index, 1);
    } else {
      updatedSelectedMagnets = [...updatedSelectedMagnets, cardId];
    }
    setInputValue((prevState) => ({
      ...prevState,
      cardIds: updatedSelectedMagnets,
    }));
  };

  const isCardSelected = (cardId: string): boolean => {
    return !!inputValue.cardIds.find((magnetId: string) => magnetId == cardId);
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
                          isCardSelected={isCardSelected(card.id)}
                          onClick={() => {
                            updateSelectedMagnets(card.id);
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
      <Grid container spacing={2} p={".5rem"}>
        {cardsData.map((card: Card) => (
          <Grid item key={card.id}>
            <BoardCardWrapper
              isCardSelected={isCardSelected(card.id)}
              onClick={() => {
                updateSelectedMagnets(card.id);
              }}
            >
              <BoardCard card={card} zoomLevel={zoomLevel} readOnly={true} />
            </BoardCardWrapper>
          </Grid>
        ))}
      </Grid>
    ) : (
      <EmptyState title={t("magneto.cards.empty.text")} />
    );
  }
};
