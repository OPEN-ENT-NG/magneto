import { FC } from "react";

import { Box } from "@mui/material";

import { cardContentWrapperStyle } from "./style";
import { CardContentProps } from "./types";
import { displayContentByType, onClick } from "./utils";
import { useBoard } from "~/providers/BoardProvider";

export const CardContent: FC<CardContentProps> = ({ card }) => {
  const { boardImages } = useBoard();

  return (
    <Box sx={cardContentWrapperStyle} onClick={() => onClick(card)}>
      {card.resourceType === "board"
        ? displayContentByType(
            card,
            boardImages?.find((img: any) => img._id === card.resourceUrl)
              ?.imageUrl,
          )
        : displayContentByType(card)}
    </Box>
  );
};
