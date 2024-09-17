import { Box, styled } from "@mui/material";
import { handleCardSize } from "../board-card/style";

export const StyledGridBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ zoomLevel }) => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, ${handleCardSize(zoomLevel).width})`,
  gap: "3rem",
  justifyContent: "center",
  width: "100%",
}));
