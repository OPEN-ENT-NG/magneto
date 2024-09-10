import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  MagnetWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
} from "./style";
import { MagnetContent } from "../magnet-content/MagnetContent";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";

export const CardsVerticalLayout: FC = () => {
  const { board } = useBoard();

  if (!board.sections?.length) return null;

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section) => (
        <SectionWrapper key={section._id} sectionNumber={board.sections.length}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <MagnetWrapper sectionNumber={board.sections.length}>
            {section.cards.map(
              (
                card, //sera remplacé par la card
              ) => (
                <Box key={card.id} sx={{ width: "20rem", height: "15rem" }}>
                  <MagnetContent magnet={card} />
                </Box>
              ),
            )}
          </MagnetWrapper>
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
