import { FunctionComponent } from "react";

import { animated } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import { BoardCard } from "../board-card/BoardCard";
import { EmptyState } from "../empty-state/EmptyState";
import { Card as CardModel } from "~/models/card.model";

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
  springs,
}: FavoriteViewByCardProps) => {
  const { t } = useTranslation("magneto");

  const filteredCards = cardsData.filter(
    (card: CardModel) =>
      searchText === "" ||
      (card.title &&
        card.title.toLowerCase().includes(searchText.toLowerCase())),
  );

  return filteredCards.length ? (
    <div>
      <animated.ul className="grid ps-0 list-unstyled mb-24">
        {filteredCards.map((card: CardModel) => (
          <animated.li
            className="g-col-4 z-1 boardSizing"
            key={card.id}
            style={{
              position: "relative",
              ...springs,
            }}
          >
            <BoardCard card={card} zoomLevel={2}></BoardCard>
          </animated.li>
        ))}
      </animated.ul>
    </div>
  ) : (
    <EmptyState title={t("magneto.cards.empty.text")} />
  );
};
