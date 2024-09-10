import { animated } from "@react-spring/web";
import { FC } from "react";
import { Card } from "~/models/card.model";
import { CardBoxStyle, LiWrapper, UlWrapper, cardBoxStyle, mainWrapperProps } from "./style";
import { useBoard } from "~/providers/BoardProvider";
import { Box } from "@mui/material";


export const CardsFreeLayout: FC = () => {
    const { board, zoomLevel } = useBoard();

    // const board = {cards: [{title: "1"},{title: "2"},{title: "3"}]}

    console.log(board)

  return (
    <Box sx={mainWrapperProps}>
      {board?.cards ? (
        <UlWrapper className="grid ps-0 list-unstyled mb-24 left-float">
          {board.cards
            .map((card: Card, index: number) => {
              return (                
                <LiWrapper isLast={index === board.cards.length -1}>
                  <CardBoxStyle key={card.id} zoomLevel={zoomLevel}>
                    {card.title} {/* will be replaced by card later */}
                  </CardBoxStyle>
                </LiWrapper>

              );
            })}
        </UlWrapper>
      ) : null}
    </Box>
  );
};
