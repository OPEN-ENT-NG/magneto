import { AppIcon } from "@edifice.io/react";
import { Box, styled } from "@mui/material";

import { IsPreviewProps } from "./types";

export const StyledAppIcon = styled(AppIcon, {
  shouldForwardProp: (prop) => prop !== "isPreview",
})<IsPreviewProps>(({ isPreview }) => ({
  width: isPreview ? "20rem !important" : "100% !important",
  height: isPreview ? "20rem !important" : "100% !important",
  display: "flex",
  justifyContent: isPreview ? "flex-start" : "center",
  alignItems: "center",

  svg: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
}));

export const StyledBoxSvg = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isPreview",
})<IsPreviewProps>(({ isPreview }) => ({
  width: isPreview ? "20rem" : "100%",
  height: isPreview ? "20rem" : "100%",
  display: "flex",
  justifyContent: isPreview ? "flex-start" : "center",
  alignItems: "center",
}));
