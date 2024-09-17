import { FunctionComponent } from "react";

import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import { useTranslation } from "react-i18next";

import { StyledGridBox } from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { EmptyState } from "../empty-state/EmptyState";
import { usePredefinedToasts } from "~/hooks/usePredefinedToasts";
import { Board } from "~/models/board.model";
import { Card as CardModel } from "~/models/card.model";
import { useDuplicateBoardMutation } from "~/services/api/boards.service";

type FavoriteViewByBoardProps = {
  boardsWithCards: Board[];
  searchText: string;
  springs: any;
  currentApp: any;
  getBoardsLoading: boolean;
};

export const FavoriteViewByBoard: FunctionComponent<
  FavoriteViewByBoardProps
> = ({ boardsWithCards, searchText }: FavoriteViewByBoardProps) => {
  const { t } = useTranslation("magneto");
  const zoomLevel = 2;
  const [duplicateBoard] = useDuplicateBoardMutation();

  const duplicateBoardsAndToast = usePredefinedToasts({
    func: duplicateBoard,
    successMessage: t("magneto.duplicate.elements.confirm"),
    failureMessage: t("magneto.duplicate.elements.error"),
  });

  // Filtrer les tableaux qui ont au moins une carte
  const filteredBoardsWithCards = boardsWithCards.filter(
    (board) =>
      board.cards.filter(
        (card: CardModel) =>
          searchText === "" ||
          (card.title &&
            card.title.toLowerCase().includes(searchText.toLowerCase())),
      ).length > 0,
  );

  return filteredBoardsWithCards.length ? (
    <div>
      <ul>
        {filteredBoardsWithCards.map((board: Board) => (
          <li key={board._id}>
            <div>
              <div className="parent">
                <h2>{board._title}</h2>
                <span
                  onClick={() => duplicateBoardsAndToast(board._id)}
                  className="duplicateText"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      duplicateBoardsAndToast(board._id);
                    }
                  }}
                >
                  <FileCopyOutlinedIcon className="copy-icon" />
                  {" " + t("magneto.cards.collection.board.duplicate")}
                </span>
              </div>
              <StyledGridBox zoomLevel={zoomLevel}>
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
                    <BoardCard
                      key={card.id}
                      card={card}
                      zoomLevel={zoomLevel}
                    />
                  ))}
              </StyledGridBox>
            </div>
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <EmptyState title={t("magneto.cards.empty.text")} />
  );
};
