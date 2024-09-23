import { AppIcon } from "@edifice-ui/react";
import { styled } from "@mui/material";

export const svgWrapperStyle = { width: "100%", height: "100%" };
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
