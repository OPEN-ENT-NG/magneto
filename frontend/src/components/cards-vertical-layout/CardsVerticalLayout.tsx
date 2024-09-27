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
import { useDrop } from "react-dnd";
import { DRAG_AND_DROP_TYPE } from "~/core/enums/drag-and-drop-type.enum";

export const CardsVerticalLayout: FC = () => {
  const { board, zoomLevel, hasEditRights } = useBoard();

  const [{ isOver }, drop] = useDrop({
    accept: "card",
    // drop: () => setHasDrop(true),
    drop: () => console.log("drop"),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  if (!board.sections?.length) return null;

  return (
    <Box sx={mainWrapperProps}>
      {board.sections.map((section) => (
        <SectionWrapper
          key={section._id}
          sectionNumber={
            hasEditRights() ? board.sections.length + 1 : board.sections.length
          }
        >
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={section} />
          </Box>
          <CardsWrapper zoomLevel={zoomLevel}>
            {section.cards.map((card) => (
              <div
              ref={drop}
              draggable="true"
              // className={
              //   isOver
              //     ? DRAG_AND_DROP_TYPE.DRAG_OVER
              //     : DRAG_AND_DROP_TYPE.NO_DRAG_OVER
              // }
              key={card.id}
            > 
            <CardWrapper>
                <BoardCard
                  card={card}
                  zoomLevel={zoomLevel}
                  canComment={board.canComment}
                  displayNbFavorites={board.displayNbFavorites}
                  key={card.id}
                />
              </CardWrapper>
            </div>
              
            ))}
          </CardsWrapper>
        </SectionWrapper>
      ))}
      {hasEditRights() && (
        <SectionWrapper sectionNumber={board.sections.length + 1} isLast={true}>
          <Box sx={sectionNameWrapperStyle}>
            <SectionName section={null} />
          </Box>
        </SectionWrapper>
      )}
    </Box>
  );
};
