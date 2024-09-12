import { FC } from "react";

import { Box } from "@mui/material";

import { CardBoxStyle, LiWrapper, UlWrapper, mainWrapperProps } from "./style";
import { Card } from "~/models/card.model";
import { useBoard } from "~/providers/BoardProvider";
import { BoardMagnet } from "../board-magnet/BoardMagnet";

export const CardsFreeLayout: FC = () => {
  const { board, zoomLevel } = useBoard();

  return (
    <Box sx={mainWrapperProps}>
      {board?.cards ? (
        <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
          {board.cards.map((card: Card, index: number) => {
            return (
              <LiWrapper isLast={index === board.cards.length - 1}>
                <BoardMagnet magnet={card} />
              </LiWrapper>
            );
          })}
        </UlWrapper>
      ) : null}
    </Box>
  );
};
