import { FC } from "react";

import { Add, Remove } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";

import {
  containerStyle,
  iconButtonStyle,
  iconStyle,
  labelStyle,
  lineStyle,
} from "./style";

interface ZoomComponentProps {
  opacity?: number;
  zoomLevel: number;
  zoomMaxLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  label?: string;
}

export const ZoomComponent: FC<ZoomComponentProps> = ({
  opacity = 1,
  zoomLevel,
  zoomMaxLevel,
  zoomIn,
  zoomOut,
  resetZoom,
  label = "Zoom",
}) => {
  const isMinZoom = zoomLevel === 0;
  const isMaxZoom = zoomLevel === zoomMaxLevel;

  return (
    <Box sx={containerStyle({ opacity })}>
      <IconButton onClick={zoomOut} disabled={isMinZoom} sx={iconButtonStyle}>
        <Remove sx={iconStyle({ disabled: isMinZoom })} />
      </IconButton>
      <Box sx={lineStyle} />
      <Typography onClick={resetZoom} sx={labelStyle} component="button">
        {label}
      </Typography>
      <Box sx={lineStyle} />
      <IconButton onClick={zoomIn} disabled={isMaxZoom} sx={iconButtonStyle}>
        <Add sx={iconStyle({ disabled: isMaxZoom })} />
      </IconButton>
    </Box>
  );
};
