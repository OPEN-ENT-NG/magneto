import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  MagnetWrapperStyle,
} from "./style";
import { BoardMagnet } from "../board-magnet/BoardMagnet";
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
          <Box sx={MagnetWrapperStyle}>
            {section.cards.map((card) => (
              <BoardMagnet magnet={card} />
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
