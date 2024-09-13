import { styled } from "@mui/material";

import { SectionWrapperProps, UlWrapperProps } from "./types";

export const mainWrapperProps = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  background: "transparent",
  zIndex: "1",
};

export const SectionWrapper = styled("div")<SectionWrapperProps>(({
  noCards = false,
  isLast = false,
}) => {
  const sectionWrapperProperties = {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    padding: "1rem 1rem 0 0",
    minWidth: "100%",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    alignSelf: "center",
    marginBottom: isLast ? "15%" : "",
  };

  let marginBottomProperties = {};
  if (isLast) {
    marginBottomProperties = { marginBottom: "15%" };
  } else if (noCards) {
    marginBottomProperties = { marginBottom: "15%" };
  }

  return { ...sectionWrapperProperties, ...marginBottomProperties };
});

export const sectionNameWrapperStyle = {
  display: "flex",
  alignSelf: "center",
  width: "93%",
  padding: "0.5rem 0 0.5rem 7%",
  flexShrink: 0,
};

export const UlWrapper = styled("ul")<UlWrapperProps>(() => {
  return {
    display: "inline-flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    marginBottom: "unset",
    marginLeft: "15px",
    paddingTop: "unset !important",
    overflowX: "auto",
    direction: "ltr",
    "&::-webkit-scrollbar": {
      height: "0.8rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(170,170,170,1)",
      borderRadius: "0.3rem",
    },
  };
});

export const CardBoxStyle = styled("div")<{ zoomLevel: number }>(({
  zoomLevel,
}) => {
  let cardSize = { margin: "0 0 15px 0" };

  switch (
    zoomLevel //will be replaced by card size later --> card margins etc
  ) {
    case 0:
      cardSize = { margin: "2px" };
      break;
    case 1:
      cardSize = { margin: "5px" };
      break;
    case 2:
      cardSize = {margin: "10px" };
      break;
    case 3:
      cardSize = { margin: "0 0 15px 0" };
      break;
    case 4:
      cardSize = { margin: "5px" };
      break;
    case 5:
      cardSize = { margin: "15px" };
      break;
  }

  return { ...cardSize };
});
