import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  MagnetWrapperStyle,
} from "./style";
import { MagnetContent } from "../magnet-content/MagnetContent";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";

export const CardsHorizontalLayout: FC = () => {
  const { board } = useBoard();

  if (!board.sections?.length) return null;

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section) => (
        <SectionWrapper key={section._id} sectionNumber={board.sections.length}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <Box sx={MagnetWrapperStyle}>
            {section.cards.map(
              (
                card, //sera remplacé par la card
              ) => (
                <Box key={card.id} sx={{ width: "15rem", height: "10rem" }}>
                  <MagnetContent magnet={card} />
                </Box>
              ),
            )}
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
