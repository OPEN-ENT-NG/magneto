import { FC } from "react";

import { Box } from "@mui/material";

import { magnetContentWrapperStyle } from "./style";
import { MagnetContentContainerProps } from "./types";
import { displayContentByType, onClick } from "./utils";

export const MagnetContentContainer: FC<MagnetContentContainerProps> = ({
  magnet,
}) => {
  return (
    <Box sx={magnetContentWrapperStyle} onClick={() => onClick(magnet)}>
      {displayContentByType(magnet)}
    </Box>
  );
};
