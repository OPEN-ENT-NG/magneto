import React, { FunctionComponent, useState } from "react";

import {
  Card,
  Modal,
  SearchBar,
  useOdeClient,
  useToggle,
} from "@edifice-ui/react";
import { mdiMagnet } from "@mdi/js";
import Icon from "@mdi/react";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import { Switch } from "@mui/material";
import { animated, useSpring } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import { CardsFilter } from "../../models/cards-filter.model";
import { useGetAllCardsCollectionQuery } from "../../services/api/cards.service";
import { EmptyState } from "../empty-state/EmptyState";
import { Board, IBoardItemResponse } from "~/models/board.model";
import { Card as CardModel, ICardItemResponse } from "~/models/card.model";
import "./MagnetsCollectionModal.scss";
import { useGetBoardsQuery } from "~/services/api/boards.service";
import { useDuplicateBoardMutation } from "~/services/api/boards.service";

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
  } = useGetBoardsQuery({
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

  const [duplicateBoard] = useDuplicateBoardMutation();

  if (getCardsError) {
    console.log("error");
  } else if (getCardsLoading) {
    console.log("loading");
  } else {
    cardsData = myCardsResult.all.map((card: ICardItemResponse) =>
      new CardModel().build(card),
    );
  }

  if (getBoardsError) {
    console.log("error");
  } else if (getBoardsLoading) {
    console.log("loading");
  } else {
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

  const onDuplicate = async (boardId: string) => {
    await duplicateBoard(boardId);
  };

  const onLeave = () => {
    toggleSwitchBoard(false);
    toggle();
  };
  console.log(
    boardsWithCards.map(
      (board: Board) =>
        board.cards.filter((card: CardModel) => {
          if (searchText === "") {
            return card;
          } else if (
            card.title.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return card;
          }
        }).length,
    ),
  );

  const magnetsCardsToDisplay = () => {
    if (!switchBoard) {
      return cardsData.filter(
        (card: CardModel) =>
          searchText === "" ||
          card.title.toLowerCase().includes(searchText.toLowerCase()),
      ).length ? (
        <div>
          <animated.ul className="grid ps-0 list-unstyled mb-24">
            {cardsData
              .filter(
                (card: CardModel) =>
                  searchText === "" ||
                  card.title.toLowerCase().includes(searchText.toLowerCase()),
              )
              .map((card: CardModel) => (
                <animated.li
                  className="g-col-4 z-1 boardSizing"
                  key={card.id}
                  style={{
                    position: "relative",
                    ...springs,
                  }}
                >
                  <Card
                    app={currentApp!}
                    options={{
                      type: "board",
                      title: card.title,
                    }}
                    isLoading={getBoardsLoading}
                    isSelectable={false}
                  >
                    <Card.Body flexDirection="column">
                      <Card.Title>{card.title}</Card.Title>
                      <div className="board-number-magnets">
                        <Icon
                          path={mdiMagnet}
                          size={1}
                          className="med-resource-card-text"
                        />
                        <Card.Text className="med-resource-card-text board-text">
                          {card.resourceType} {t("magneto.magnets")}
                        </Card.Text>
                      </div>
                    </Card.Body>
                  </Card>
                </animated.li>
              ))}
          </animated.ul>
        </div>
      ) : (
        <EmptyState title={t("magneto.cards.empty.text")} />
      );
    } else {
      return boardsWithCards.some((board) =>
        board.cards.some(
          (card) =>
            searchText === "" ||
            card.title.toLowerCase().includes(searchText.toLowerCase()),
        ),
      ) ? (
        <div>
          <ul>
            {boardsWithCards.map((board: Board) => (
              <li key={board._id}>
                {board.cards.some(
                  (card) =>
                    searchText === "" ||
                    card.title.toLowerCase().includes(searchText.toLowerCase()),
                ) && (
                  <div>
                    <div className="parent">
                      <h2>{board._title}</h2>
                      <span
                        onClick={() => onDuplicate(board._id)}
                        className="duplicateText"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            onDuplicate(board._id);
                          }
                        }}
                      >
                        <FileCopyOutlinedIcon className="copy-icon" />
                        {" " + t("magneto.cards.collection.board.duplicate")}
                      </span>
                    </div>
                    <animated.ul className="grid ps-0 list-unstyled mb-24">
                      {board.cards
                        .filter(
                          (card: CardModel) =>
                            searchText === "" ||
                            card.title
                              .toLowerCase()
                              .includes(searchText.toLowerCase()),
                        )
                        .map((card: CardModel) => (
                          <animated.li
                            className="g-col-4 z-1 boardSizing"
                            key={card.id}
                            style={{
                              position: "relative",
                              ...springs,
                            }}
                          >
                            <Card
                              app={currentApp!}
                              options={{
                                type: "board",
                                title: card.title,
                              }}
                              isLoading={getBoardsLoading}
                              isSelectable={false}
                            >
                              <Card.Body flexDirection={"column"}>
                                <Card.Title>{card.title}</Card.Title>
                                <div className="board-number-magnets">
                                  <Icon
                                    path={mdiMagnet}
                                    size={1}
                                    className="med-resource-card-text"
                                  />
                                  <Card.Text className="med-resource-card-text board-text">
                                    {card.resourceType} {t("magneto.magnets")}
                                  </Card.Text>
                                </div>
                              </Card.Body>
                            </Card>
                          </animated.li>
                        ))}
                    </animated.ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState title={t("magneto.cards.empty.text")} />
      );
    }
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
                value={switchBoard}
                onChange={toggleSwitchBoard}
                className="switchFav"
              />
              {t("magneto.cards.collection.board.view")}
            </div>
            {magnetsCardsToDisplay()}
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
