import { FC } from "react";

import { Box, Typography } from "@mui/material";

import { captionStyle, descriptionStyle, imgContentWrapper } from "./style";
import { PreviewContentImageProps } from "./types";

export const PreviewContentImage: FC<PreviewContentImageProps> = ({ card }) => (
  <Box sx={imgContentWrapper}>
    <img src={`${card.resourceUrl}`} alt="" />
    <Typography sx={captionStyle}>{card.caption}</Typography>
    <Typography sx={descriptionStyle}>{card.description}</Typography>
  </Box>
);
