import { styled, Typography } from "@mui/material";

import { StyledTypographyProps } from "./types";

export const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "isOverflowing",
})<StyledTypographyProps>(({ isOverflowing }) => ({
  maxWidth: "100%",
  overflow: "hidden",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  maxHeight: "7rem",
  fontSize: "1.5rem",
  lineHeight: "23px",
  color: "#5b6472",
  ...(isOverflowing && {
    maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
    WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
  }),
}));

export const buttonStyle = {
  alignSelf: "flex-start",
  color: "#2A9CC8",
  fontSize: "1.2rem",
  fontWeight: "bolder",
  fontFamily: "roboto",
  padding: 0,
  "&:hover": {
    color: "#FF8500",
    backgroundColor: "transparent",
  },
};

export const boardDescriptionWrapperSyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
};
