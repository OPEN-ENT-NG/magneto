import { CardContent, styled, Typography } from "@mui/material";

import { RESOURCE_TYPE } from "~/core/enums/resource-type.enum";

const handleStyledCardContentHeight = (zoomLevel: number) => {
  switch (zoomLevel) {
    case 0:
      return { minHeight: "230px" };

    case 1:
      return { minHeight: "230px" };

    case 2:
      return { minHeight: "230px" };

    case 3:
      return { minHeight: "230px" };

    case 4:
      return { minHeight: "230px" };

    case 5:
      return { minHeight: "207px" };

    default:
      return { minHeight: "230px" };
  }
};

export const StyledCardContent = styled(CardContent, {
  shouldForwardProp: (prop) => prop !== "isTheme1D",
})<{ isTheme1D?: boolean }>(({ isTheme1D }) => ({
  ...handleStyledCardContentHeight,
  flex: 1,
  overflow: "hidden",
  paddingLeft: "0.6rem",
  paddingRight: "0.6rem",
  paddingTop: 0,
  paddingBottom: 0,
  display: "flex",
  flexDirection: "column",
  ...(isTheme1D && { fontFamily: "Arimo" }),
}));

export const StyledContentTitleTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "zoomLevel",
})<{ zoomLevel: number }>(({ zoomLevel }) => ({
  fontSize: "1.6rem",
  fontWeight: "bold",
  lineHeight: "1.8rem",
  overflowWrap: "break-word",
  color: "#4B4B4B",
  fontFamily: "inherit",
  ...(zoomLevel < 2 && {
    display: "-webkit-box",
    overflow: "hidden",
    textOverflow: "ellipsis",
    WebkitLineClamp: zoomLevel === 0 ? "3" : "4",
    WebkitBoxOrient: "vertical",
    paddingBottom: 0,
  }),
  ...(zoomLevel >= 2 && {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    paddingBottom: "1rem",
  }),
}));

export const CardContentWrapper = styled("div")<{ resourceType: string }>(({
  resourceType,
}) => {
  return {
    flex: 1,
    overflow: "hidden",
    width: "100%",
    aspectRatio: "16 / 9",
    fontFamily: "inherit",
    borderRadius: resourceType !== RESOURCE_TYPE.TEXT ? "1rem" : "unset",
  };
});
