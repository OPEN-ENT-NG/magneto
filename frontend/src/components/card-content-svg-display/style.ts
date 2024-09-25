import { AppIcon } from "@edifice-ui/react";
import { Box, styled } from "@mui/material";

export const StyledAppIcon = styled(AppIcon)({
  width: "100% !important",
  height: "100% !important",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  svg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
});

export const StyledBoxSvg = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
