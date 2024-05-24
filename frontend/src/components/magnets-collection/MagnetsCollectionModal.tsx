import React, { FunctionComponent, useEffect, useRef, useState } from "react";

import {
  Card,
  Modal,
  SearchBar,
  useOdeClient,
  useToggle,
} from "@edifice-ui/react";
import { mdiMagnet } from "@mdi/js";
import Icon from "@mdi/react";
import { Box, Switch, Tab, Tabs } from "@mui/material";
import { animated, useSpring } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import { CardsFilter } from "../../models/cards-filter.model";
import { getAllCardsCollection } from "../../services/api/cards.service";
import { Board } from "~/models/board.model";
import { Card as CardModel } from "~/models/card.model";
import "./MagnetsCollectionModal.scss";
import { ICardsParamsRequest } from "~/models/card.model";
import { getAllBoards } from "~/services/api/boards.service";

type props = {
  isOpen: boolean;
  toggle: () => void;
};

export const MagnetsCollectionModal: FunctionComponent<props> = ({
  isOpen,
  toggle,
}: props) => {
  const { currentApp } = useOdeClient();
  const { t } = useTranslation();

  const [cardsData, setCardsData] = useState<CardModel[]>([]);
  const [boardData, setBoardData] = useState<Board[]>([]);
  const [boardsWithCards, setBoardsWithCards] = useState<Board[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [switchBoard, toggleSwitchBoard] = useToggle(false);
  const filter = new CardsFilter();
  const baseParams: ICardsParamsRequest = {
    page: filter.page,
    sortBy: filter.sortBy,
    searchText: filter.searchText,
    isShared: filter.isShared,
    isPublic: filter.isPublic,
    isFavorite: filter.isFavorite,
  };
  //const [params, setParams] = useState<ICardsParamsRequest>(baseParams);

  const fetchCards = async () => {
    try {
      getAllCardsCollection(baseParams).then((cards) => {
        setCardsData(cards.all);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  const springs = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
  });

  const magnetsCardsToDisplay = () => {
    if (!switchBoard) {
      return (
        <div>
          <animated.ul className="grid ps-0 list-unstyled mb-24">
            {cardsData.length &&
              cardsData
                .filter((card) => {
                  if (searchText === "") {
                    return card;
                  } else if (
                    card.title.toLowerCase().includes(searchText.toLowerCase())
                  ) {
                    return card;
                  }
                })
                .map((card) => (
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
                      // onClick={() => {setIsToasterOpen()}}
                      // isLoading={getBoardsLoading}
                      isSelectable={false}
                    >
                      <Card.Body flexDirection={"column"}>
                        <Card.Title>{card.title}</Card.Title>

                        <div className="board-number-magnets">
                          <Icon
                            path={mdiMagnet}
                            size={1}
                            className="med-resource-card-text"
                          ></Icon>
                          <Card.Text className="med-resource-card-text board-text">
                            {card.resourceType} {t("magneto.magnets")}
                          </Card.Text>
                        </div>
                      </Card.Body>
                    </Card>
                  </animated.li>
                ))}
          </animated.ul>
          <div ref={observerTarget}></div>
        </div>
      );
    } else {
      return (
        <div>
          <ul>
            {boardsWithCards.map((board) => (
              <ul>
                {board.cards.filter((card) => {
                  if (searchText === "") {
                    return card;
                  } else if (
                    card.title.toLowerCase().includes(searchText.toLowerCase())
                  ) {
                    return card;
                  }
                }).length > 0 && (
                  <div>
                    <h2>{board.title}</h2>
                    <animated.ul className="grid ps-0 list-unstyled mb-24">
                      {board.cards
                        .filter((card) => {
                          if (searchText === "") {
                            return card;
                          } else if (
                            card.title
                              .toLowerCase()
                              .includes(searchText.toLowerCase())
                          ) {
                            return card;
                          }
                        })
                        .map((card) => (
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
                              // onClick={() => {setIsToasterOpen()}}
                              // isLoading={getBoardsLoading}
                              isSelectable={false}
                            >
                              <Card.Body flexDirection={"column"}>
                                <Card.Title>{card.title}</Card.Title>

                                <div className="board-number-magnets">
                                  <Icon
                                    path={mdiMagnet}
                                    size={1}
                                    className="med-resource-card-text"
                                  ></Icon>
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
              </ul>
            ))}
          </ul>
        </div>
      );
    }
  };

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchCards();
        }
      },
      { threshold: 1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget]);

  const fetchBoards = async () => {
    try {
      getAllBoards({
        isPublic: false,
        isShared: true,
        isDeleted: false,
        sortBy: "modificationDate",
        page: 0,
      }).then((boards) => {
        setBoardData(boards);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchBoards();
  }, []);

  useEffect(() => {
    setBoardsWithCards(
      boardData.map((board) => {
        return {
          ...board,
          cards: cardsData.filter((card) => card.boardId === board._id),
        } as Board;
      }),
    );
  }, [boardData]);

  return (
    <>
      {isOpen && (
        <Modal
          id={"createFolder"}
          isOpen={isOpen}
          onModalClose={toggle}
          size="lg"
          viewport={false}
        >
          <Modal.Header onModalClose={toggle}>
            <h4>Collection d'aimants</h4>
          </Modal.Header>
          <Modal.Body>
            <SearchBar
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder="Search something...."
              size="md"
              isVariant
            />
            <div>
              <Switch value={switchBoard} onChange={toggleSwitchBoard} />
              Ranger par tableau
            </div>
            <Box sx={{ width: "100%" }}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs value={1} aria-label="basic tabs example">
                  <Tab label="AIMANTS MIS EN FAVORIS" />
                </Tabs>
              </Box>
              {magnetsCardsToDisplay()}
            </Box>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};
