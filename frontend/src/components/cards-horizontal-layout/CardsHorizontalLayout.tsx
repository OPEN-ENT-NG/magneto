import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardBoxStyle,
  UlWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { SectionName } from "../section-name/SectionName";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const CardsHorizontalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();

  if (!board.sections?.length) return null;

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section, sectionIndex) => (
        <SectionWrapper noCards={section.cards.length === 0} key={section._id}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <UlWrapper className="grid ps-0 list-unstyled left-float">
            {section.cards.map((card: Card, cardIndex) => {
              return (
                <CardBoxStyle key={card.id} zoomLevel={zoomLevel}>
                  <BoardCard
                    card={card}
                    zoomLevel={zoomLevel}
                    canComment={board.canComment}
                    displayNbFavorites={board.displayNbFavorites}
                    key={card.id} 
                    cardIndex={cardIndex}
                    sectionIndex={sectionIndex}                  />
                </CardBoxStyle>
              );
            })}
          </UlWrapper>
        </SectionWrapper>
      ))}
      {hasEditRights() && (
        <SectionWrapper isLast={true}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={null} />
          </Box>
        </SectionWrapper>
      )}
    </Box>
  );
};
