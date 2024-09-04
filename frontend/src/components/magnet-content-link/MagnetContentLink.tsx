import { FC } from "react";

import { Box } from "@mui/material";

import { svgWrapperStyle } from "./style";
import { DefaultLinkIcon } from "../SVG/DefaultLinkIcon";

export const MagnetContentLink: FC = () => {
  return (
    <Box sx={svgWrapperStyle}>
      <DefaultLinkIcon />
    </Box>
  );
};
