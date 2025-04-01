import { FC } from "react";

import { Box } from "@mui/material";

import { cardContentWrapperStyle } from "./style";
import { CardContentProps } from "./types";
import { displayContentByType, onClick } from "./utils";
import MagnetoIcon from "../SVG/MagnetoIcon";
import { useBoard } from "~/providers/BoardProvider";

export const CardContent: FC<CardContentProps> = ({ card }) => {
  const { boardImages, isExternalView } = useBoard();

  return (
    <Box sx={cardContentWrapperStyle} onClick={() => onClick(card)}>
      {card.resourceType === "board" ? (
        isExternalView ? (
          <MagnetoIcon width="80%" height="80%" />
        ) : (
          displayContentByType(
            card,
            boardImages?.find((img: any) => img._id === card.resourceUrl)
              ?.imageUrl,
          )
        )
      ) : (
        displayContentByType(card)
      )}
    </Box>
  );
};
