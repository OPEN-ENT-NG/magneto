import { FC } from "react";

import { Box } from "@mui/material";

import {
  SectionWrapper,
  sectionNameWrapperStyle,
  mainWrapperProps,
  CardBoxStyle,
  LiWrapper,
  UlWrapper,
} from "./style";
import { SectionName } from "../section-name/SectionName";
import { useBoard } from "~/providers/BoardProvider";
import { Card } from "~/models/card.model";

export const CardsHorizontalLayout: FC = () => {
  const { board, zoomLevel } = useBoard();

  if (!board.sections?.length) return null;

  console.log(board.sections);

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section, index: number) => (
        <SectionWrapper noCards={section.cards.length === 0} key={section._id}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <UlWrapper className="grid ps-0 list-unstyled left-float">
            {section.cards.map((card: Card, index: number) => {
            return (
              <li>
                <CardBoxStyle key={card.id} zoomLevel={zoomLevel}>
                  {card.title} {/* will be replaced by card later */}
                </CardBoxStyle>
              </li>
            );
          })}
          </UlWrapper>
    
        </SectionWrapper>
      ))}
      <SectionWrapper isLast={true}>
        <Box sx={sectionNameWrapperStyle}>
          <SectionName section={null} />
        </Box>
      </SectionWrapper>
    </Box>
  );
};
