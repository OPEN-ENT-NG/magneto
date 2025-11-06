import { FC } from "react";

import { Box, Typography } from "@mui/material";

import {
  wrapperStyles,
  elementWrapperStyles,
  iconStyles,
  textStyles,
} from "./style";
import { FolderTitleProps } from "./types";
import { useTheme } from "~/hooks/useTheme";

export const FolderTitle: FC<FolderTitleProps> = ({
  text,
  SVGLeft = null,
  SVGRight = null,
  position = "start",
}) => {
  const { isTheme1D } = useTheme();
  return (
    <Box sx={wrapperStyles(position)}>
      <Box sx={elementWrapperStyles}>
        {SVGLeft && <Box sx={iconStyles}>{SVGLeft}</Box>}
        <Typography sx={textStyles(isTheme1D)}>{text}</Typography>
        {SVGRight && <Box sx={iconStyles}>{SVGRight}</Box>}
      </Box>
    </Box>
  );
};
