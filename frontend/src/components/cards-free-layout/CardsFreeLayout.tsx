import { FC } from "react";

import { Box } from "@mui/material";

import { LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { BoardCard } from "../board-card/BoardCard";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";

export const CardsFreeLayout: FC = () => {
  const { board, zoomLevel } = useBoard();

  return (
    <Box sx={mainWrapperProps}>
      {board?.cards ? (
        <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
          {board.cards.map((card: Card, index: number) => {
            return (
              <LiWrapper isLast={index === board.cards.length - 1}>
                <BoardCard card={card} zoomLevel={zoomLevel} />
              </LiWrapper>
            );
          })}
        </UlWrapper>
      ) : null}
    </Box>
  );
};
