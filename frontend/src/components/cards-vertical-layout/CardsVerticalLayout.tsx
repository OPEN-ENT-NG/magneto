import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardWrapper,
  CardsWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";

export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel, boardRights } = useBoard();

  if (!board.sections?.length) return null;

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section) => (
        <SectionWrapper
          key={section._id}
          sectionNumber={
            boardRights?.contrib
              ? board.sections.length + 1
              : board.sections.length
          }
        >
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <CardsWrapper zoomLevel={zoomLevel}>
            {section.cards.map((card) => (
              <CardWrapper key={card.id}>
                <BoardCard
                  card={card}
                  zoomLevel={zoomLevel}
                  canComment={board.canComment}
                  displayNbFavorites={board.displayNbFavorites}
                  key={card.id}
                />
              </CardWrapper>
            ))}
          </CardsWrapper>
        </SectionWrapper>
      ))}
      {boardRights?.contrib && (
        <SectionWrapper sectionNumber={board.sections.length} isLast={true}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={null} />
          </Box>
        </SectionWrapper>
      )}
    </Box>
  );
};
