import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  MagnetWrapperStyle,
  CardBoxStyle,
} from "./style";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";

export const CardsHorizontalLayout: FC = () => {
  const { board, zoomLevel } = useBoard();

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
                <CardBoxStyle key={card.id} zoomLevel={zoomLevel}>
                  {card.title} {/* will be replaced by card later */}
                </CardBoxStyle>
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
