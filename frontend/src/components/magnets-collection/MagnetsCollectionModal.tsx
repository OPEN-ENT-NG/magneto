import React, { FunctionComponent, useState } from "react";

import { Modal, SearchBar, useOdeClient, useToggle } from "@edifice-ui/react";
import { Switch } from "@mui/material";
import { useSpring } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import { FavoriteViewByBoard } from "./FavoriteViewByBoard.tsx";
import { FavoriteViewByCard } from "./FavoriteViewByCard.tsx";
import { CardsFilter } from "../../models/cards-filter.model";
import { useGetAllCardsCollectionQuery } from "../../services/api/cards.service";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { Card as CardModel, ICardItemResponse } from "~/models/card.model";
import "./MagnetsCollectionModal.scss";
import { SVGProvider } from "~/providers/SVGProvider/index.tsx";
import { useGetAllBoardsQuery } from "~/services/api/boards.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
};

export const MagnetsCollectionModal: FunctionComponent<props> = ({
  isOpen,
  toggle,
}: props) => {
  const { currentApp } = useOdeClient();
  const { t } = useTranslation("magneto");

  const [searchText, setSearchText] = useState<string>("");
  const [switchBoard, toggleSwitchBoard] = useToggle(false);
  const filter = new CardsFilter();

  const {
    data: myBoardsResult,
    isLoading: getBoardsLoading,
    error: getBoardsError,
  } = useGetAllBoardsQuery({
    isPublic: false,
    isShared: true,
    isDeleted: false,
    sortBy: "modificationDate",
    page: 0,
  }) || {};

  let boardData: Board[] = [];
  let boardsWithCards: Board[] = [];
  let cardsData: CardModel[] = [];

  const {
    data: myCardsResult,
    isLoading: getCardsLoading,
    error: getCardsError,
  } = useGetAllCardsCollectionQuery({
    page: filter.page,
    sortBy: filter.sortBy,
    searchText: filter.searchText,
    isShared: filter.isShared,
    isPublic: filter.isPublic,
    isFavorite: filter.isFavorite,
  }) || {};

  if (getCardsError) {
    console.log("error");
  } else if (getCardsLoading) {
    console.log("loading");
  } else if (myCardsResult?.all) {
    cardsData = myCardsResult.all.map((card: ICardItemResponse) =>
      new CardModel().build(card),
    );
  }

  if (getBoardsError) {
    console.log("error");
  } else if (getBoardsLoading) {
    console.log("loading");
  } else if (myBoardsResult?.all) {
    boardData = myBoardsResult.all.map((board: IBoardItemResponse) =>
      new Board().build(board),
    );
    boardsWithCards = boardData.map((board: Board) => {
      return {
        ...board,
        cards: cardsData.filter(
          (card: CardModel) => card.boardId === board._id,
        ),
      } as Board;
    });
  }

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const onLeave = () => {
    toggle();
  };

  return (
    <>
      {isOpen && (
        <Modal
          id={"createFolder"}
          isOpen={isOpen}
          onModalClose={onLeave}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={onLeave}>
            <h4>{t("magneto.cards.collection")}</h4>
          </Modal.Header>
          <Modal.Body>
            <SearchBar
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder={t("magneto.search.placeholder")}
              size="md"
              isVariant
              className="searchbar"
            />
            <div className="headerFav">
              {t("magneto.cards.collection.favorite")}
            </div>
            <div>
              <Switch
                checked={switchBoard}
                onChange={toggleSwitchBoard}
                className="switchFav"
              />
              {t("magneto.cards.collection.board.view")}
            </div>
            <SVGProvider>
              {switchBoard ? (
                <FavoriteViewByBoard
                  boardsWithCards={boardsWithCards}
                  searchText={searchText}
                  springs={springs}
                  currentApp={currentApp}
                  getBoardsLoading={getBoardsLoading}
                />
              ) : (
                <FavoriteViewByCard
                  cardsData={cardsData}
                  searchText={searchText}
                  springs={springs}
                  currentApp={currentApp}
                  getBoardsLoading={getBoardsLoading}
                />
              )}
            </SVGProvider>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
