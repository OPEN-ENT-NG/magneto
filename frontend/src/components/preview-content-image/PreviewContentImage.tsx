import { FC } from "react";

import { Box } from "@mui/material";

import { imgContentWrapper, imgWrapper, ResponsiveImage } from "./style";
import { PreviewContentImageProps } from "./types";

export const PreviewContentImage: FC<PreviewContentImageProps> = ({ ressourceUrl }) => (
  <Box sx={imgContentWrapper}>
    <Box sx={imgWrapper}>
      <ResponsiveImage src={`${ressourceUrl}`} alt="" />
    </Box>
  </Box>
);
