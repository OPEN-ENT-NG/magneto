import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { BoardCard } from "../board-card/BoardCard";
import { EmptyState } from "../empty-state/EmptyState";
import { Card, Card as CardModel } from "~/models/card.model";
import { StyledGridBox } from "./style";

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
  const zoomLevel = 2;

  const filteredCards = cardsData.filter(
    (card: CardModel) =>
      searchText === "" ||
      (card.title &&
        card.title.toLowerCase().includes(searchText.toLowerCase())),
  );

  return filteredCards.length ? (
    <StyledGridBox zoomLevel={zoomLevel}>
      {filteredCards.map((card: Card) => (
        <BoardCard key={card.id} card={card} zoomLevel={zoomLevel} />
      ))}
    </StyledGridBox>
  ) : (
    <EmptyState title={t("magneto.cards.empty.text")} />
  );
};
