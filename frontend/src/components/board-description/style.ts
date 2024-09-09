import { styled, Typography } from "@mui/material";

import { StyledTypographyProps } from "./types";

export const StyledTypography = styled(Typography)<StyledTypographyProps>(
  ({ isOverflowing }) => ({
    maxWidth: "100%",
    overflow: "hidden",
    whiteSpace: "normal",
    wordWrap: "break-word",
    overflowWrap: "break-word",
    maxHeight: "7rem",
    fontSize: "1.5rem",
    lineHeight: "23px",
    color: "#5b6472",
    ...(isOverflowing && {
      maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
      WebkitMaskImage:
        "linear-gradient(to bottom, black 60%, transparent 100%)",
    }),
  }),
);

export const buttonStyle = {
  alignSelf: "flex-start",
  mt: 1,
  color: "#E50037",
  fontSize: "1.2rem",
  fontWeight: "bolder",
  fontFamily: "roboto",
  "&:hover": {
    backgroundColor: "rgba(229, 0, 55, 0.1)",
  },
};

export const boardDescriptionWrapperSyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
};
