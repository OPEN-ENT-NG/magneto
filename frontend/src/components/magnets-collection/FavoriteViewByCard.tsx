import React, { FunctionComponent } from "react";

import { Card } from "@edifice-ui/react";
import { mdiMagnet } from "@mdi/js";
import Icon from "@mdi/react";
import { animated } from "@react-spring/web";
import { useTranslation } from "react-i18next";

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
  currentApp,
  getBoardsLoading,
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
            <Card
              app={currentApp!}
              options={{
                type: "board",
                title: card.title || "",
              }}
              isLoading={getBoardsLoading}
              isSelectable={false}
            >
              <Card.Body flexDirection="column">
                <Card.Title>{card.title || ""}</Card.Title>
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
};
