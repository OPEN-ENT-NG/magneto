import { FC } from "react";

import { Box } from "@mui/material";

import { magnetContentWrapperStyle } from "./style";
import { MagnetContentProps } from "./types";
import { displayContentByType, onClick } from "./utils";

export const MagnetContent: FC<MagnetContentProps> = ({ magnet }) => {
  return (
    <Box sx={magnetContentWrapperStyle} onClick={() => onClick(magnet)}>
      {displayContentByType(magnet)}
    </Box>
  );
};
