import React, { FunctionComponent } from "react";

import { Card } from "@edifice-ui/react";
import { mdiMagnet } from "@mdi/js";
import Icon from "@mdi/react";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import { animated } from "@react-spring/web";
import { useTranslation } from "react-i18next";

import { EmptyState } from "../empty-state/EmptyState";
import { Board } from "~/models/board.model";
import { Card as CardModel } from "~/models/card.model";
import { useDuplicateBoardMutation } from "~/services/api/boards.service";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";

type FavoriteViewByBoardProps = {
  boardsWithCards: Board[];
  searchText: string;
  springs: any;
  currentApp: any;
  getBoardsLoading: boolean;
};

export const FavoriteViewByBoard: FunctionComponent<
  FavoriteViewByBoardProps
> = ({
  boardsWithCards,
  searchText,
  springs,
  currentApp,
  getBoardsLoading,
}: FavoriteViewByBoardProps) => {
  const { t } = useTranslation("magneto");
  const [duplicateBoard] = useDuplicateBoardMutation();

  const displayDuplicateBoardsToast = (boardId: string) => {
      const duplicateBoardsToast = usePredefinedToasts({
      func: duplicateBoard,
      parameter: boardId,
      successMessage: t("magneto.duplicate.elements.confirm"),
      failureMessage: t("magneto.duplicate.elements.error"),
    });
    duplicateBoardsToast();
  }
  

  // Filtrer les tableaux qui ont au moins une carte
  const filteredBoardsWithCards = boardsWithCards.filter(
    (board) => board.cards.length > 0,
  );

  return filteredBoardsWithCards.length ? (
    <div>
      <ul>
        {filteredBoardsWithCards.map((board: Board) => (
          <li key={board._id}>
            {board.cards.some(
              (card) =>
                searchText === "" ||
                (card.title &&
                  card.title.toLowerCase().includes(searchText.toLowerCase())),
            ) && (
              <div>
                <div className="parent">
                  <h2>{board._title}</h2>
                  <span
                    onClick={() => displayDuplicateBoardsToast(board._id)}
                    className="duplicateText"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        displayDuplicateBoardsToast(board._id);
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
                        (card.title &&
                          card.title
                            .toLowerCase()
                            .includes(searchText.toLowerCase())),
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
                            title: card.title || "",
                          }}
                          isLoading={getBoardsLoading}
                          isSelectable={false}
                        >
                          <Card.Body flexDirection={"column"}>
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
            )}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <EmptyState title={t("magneto.cards.empty.text")} />
  );
};
