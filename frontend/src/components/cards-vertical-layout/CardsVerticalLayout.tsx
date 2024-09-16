import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardsWrapperStyle,
  CardWrapper,
} from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";

export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel } = useBoard();

  if (!board.sections?.length) return null;

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section) => (
        <SectionWrapper key={section._id} sectionNumber={board.sections.length}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <Box sx={CardsWrapperStyle}>
            {section.cards.map((card) => (
              <CardWrapper key={card.id} zoomLevel={zoomLevel}>
                <BoardCard card={card} />
              </CardWrapper>
            ))}
          </Box>
        </SectionWrapper>
      ))}
      <SectionWrapper sectionNumber={board.sections.length} isLast={true}>
        <Box sx={sectionNameWrapperStyle}>
          <SectionName section={null} />
        </Box>
      </SectionWrapper>
    </Box>
  );
};
