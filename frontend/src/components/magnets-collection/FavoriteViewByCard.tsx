import { FunctionComponent } from "react";

import { useTranslation } from "react-i18next";

import { BoardCard } from "../board-card/BoardCard";
import { EmptyState } from "../empty-state/EmptyState";
import { Card, Card as CardModel } from "~/models/card.model";
import { LiWrapper } from "../cards-free-layout/style";
import { UlWrapperFavorite } from "./style";
import { Box } from "@mui/material";

type FavoriteViewByCardProps = {
  cardsData: CardModel[];
  searchText: string;
  springs: any;
  currentApp: any;
  getBoardsLoading: boolean;
};

export const FavoriteViewByCard: FunctionComponent<FavoriteViewByCardProps> = ({
  cardsData,
  searchText,
}: FavoriteViewByCardProps) => {
  const { t } = useTranslation("magneto");

  const filteredCards = cardsData.filter(
    (card: CardModel) =>
      searchText === "" ||
      (card.title &&
        card.title.toLowerCase().includes(searchText.toLowerCase())),
  );

  return filteredCards.length ? (
    <UlWrapperFavorite>
      {filteredCards.map((card: Card) => (
        <LiWrapper>
          <BoardCard card={card} zoomLevel={2} />
        </LiWrapper>
      ))}
    </UlWrapperFavorite>
  ) : (
    <EmptyState title={t("magneto.cards.empty.text")} />
  );
};
