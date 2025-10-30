import { FC } from "react";

import { SearchInput, IconButton } from "@cgi-learning-hub/ui";
import { AddRounded, RemoveRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

import {
  containerStyle,
  iconButtonStyle,
  iconStyle,
  labelStyle,
  searchInputStyle,
} from "./style";
import { useBoard } from "~/providers/BoardProvider";

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
}: ZoomComponentProps) => {
  const isMinZoom = zoomLevel === 0;
  const isMaxZoom = zoomLevel === zoomMaxLevel;

  const { searchText, setSearchText } = useBoard();

  return (
    <Box sx={containerStyle({ opacity })}>
      <SearchInput
        sx={searchInputStyle}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <IconButton onClick={zoomOut} disabled={isMinZoom} sx={iconButtonStyle}>
        <RemoveRounded sx={iconStyle({ disabled: isMinZoom })} />
      </IconButton>
      <Typography onClick={resetZoom} sx={labelStyle} component="button">
        {label}
      </Typography>
      <IconButton onClick={zoomIn} disabled={isMaxZoom} sx={iconButtonStyle}>
        <AddRounded sx={iconStyle({ disabled: isMaxZoom })} />
      </IconButton>
    </Box>
  );
};
