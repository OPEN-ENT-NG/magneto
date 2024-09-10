import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import { BoardContextType, BoardProviderProps } from "./types";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";
import { Board } from "~/models/board.model";
import { Cards } from "~/models/card.model";
import { useGetBoardsByIdsQuery } from "~/services/api/boards.service";
import {
  useLazyGetAllCardsByBoardIdQuery,
  useLazyGetCardsBySectionQuery,
} from "~/services/api/cards.service";
import { useGetSectionsByBoardQuery } from "~/services/api/sections.service";
import { Card } from "~/models/card.model";
import { useGetAllCardsByBoardQuery } from "~/services/api/cards.service";

const BoardContext = createContext<BoardContextType | null>(null);

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};

export const BoardProvider: FC<BoardProviderProps> = ({ children }) => {
  const [board, setBoard] = useState<Board>(new Board());
  const [cards, setCards] = useState<Card[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(3);

  const { id = "" } = useParams();

  const { currentData: myBoardResult } = useGetBoardsByIdsQuery([id]);
  const { currentData: mySectionsResult } = useGetSectionsByBoardQuery(id);

  const { currentData: myCardsResult } = useGetAllCardsByBoardQuery({
    page: 0,
    boardId: id,
    fromStartPage: true
  });
  const [triggerGetCards] = useLazyGetCardsBySectionQuery();
  const [triggerGetAllCards] = useLazyGetAllCardsByBoardIdQuery();

  useEffect(() => {
    const fetchCardData = async () => {
      if (
        myBoardResult &&
        mySectionsResult &&
        myBoardResult.all[0].layoutType !== LAYOUT_TYPE.FREE
      ) {
        const newBoard = new Board().build(myBoardResult.all[0]);
        newBoard.sections = mySectionsResult.all;

        const cardPromises = newBoard.sections.map((section) =>
          triggerGetCards(section._id).unwrap(),
        );
        try {
          const cardsResults = await Promise.all(cardPromises);
          newBoard.sections = newBoard.sections.map((section, index) => ({
            ...section,
            cards: new Cards(cardsResults[index]).all,
          }));
          return setBoard(newBoard);
        } catch (error) {
          return console.error("Failed to fetch cards:", error);
        }
      }
      if (myBoardResult) {
        try {
          const newBoard = new Board().build(myBoardResult.all[0]);
          const allCardsResult = await triggerGetAllCards(id).unwrap();
          const allCards = new Cards(allCardsResult).all;
          newBoard.cards = allCards;
          return setBoard(newBoard);
        } catch (error) {
          return console.error("Failed to fetch all cards for board:", error);
        }
      }
    };

    fetchCardData();
  }, [myBoardResult, mySectionsResult, triggerGetCards, triggerGetAllCards, myCardsResult]);
   
  const zoomIn = (): void => {
    if (zoomLevel < 5) setZoomLevel(zoomLevel + 1);
  };

  const zoomOut = (): void => {
    if (zoomLevel > 0) setZoomLevel(zoomLevel - 1);
  };

  const resetZoom = (): void => {
    setZoomLevel(3);
  };

  const value = useMemo<BoardContextType>(
    () => ({
      board,
      setBoard,
      zoomLevel,
      setZoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
    }),
    [board, zoomLevel],
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};
