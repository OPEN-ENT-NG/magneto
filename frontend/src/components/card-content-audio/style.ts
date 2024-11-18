import { Box, styled } from "@mui/material";

import { AudioWrapperProps } from "./types";

export const AudioWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPreview',
})<AudioWrapperProps>(({ isPreview }) => ({
  width: "100%",
  height: "100%",
  display: "flex",
  ...(isPreview ? {} : { justifyContent: "center" }),
  alignItems: "center",
}));
