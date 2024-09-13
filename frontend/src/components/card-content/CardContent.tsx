import { FC } from "react";

import { Box } from "@mui/material";

import { cardContentWrapperStyle } from "./style";
import { CardContentProps } from "./types";
import { displayContentByType, onClick } from "./utils";

export const CardContent: FC<CardContentProps> = ({ card }) => {
  return (
    <Box sx={cardContentWrapperStyle} onClick={() => onClick(card)}>
      {displayContentByType(card)}
    </Box>
  );
};
