import { animated } from "@react-spring/web";
import { FC } from "react";
import { Card } from "~/models/card.model";
import { LiWrapper, UlWrapper, cardBoxStyle } from "./style";
import { useBoard } from "~/providers/BoardProvider";
import { Box } from "@mui/material";


export const CardsFreeLayout: FC = () => {
    const { board } = useBoard();

    // const board = {cards: [{title: "1"},{title: "2"},{title: "3"}]}

  return (
    <>
      {board?.cards ? (
        <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
          {board.cards
            .map((card: Card, index: number) => {
              return (
                <LiWrapper isFirst={false}>

                
                  <Box sx={cardBoxStyle}>{card.title}</Box>
                </LiWrapper>

              );
            })}
        </UlWrapper>
      ) : null}
    </>
  );
};
