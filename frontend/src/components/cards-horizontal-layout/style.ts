import { styled } from "@mui/material";

import { SectionWrapperProps } from "./types";

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
  let marginBottomProperties = {};
  if (isLast) {
    marginBottomProperties = { marginBottom: "15%" };
  } else if (noCards) {
    marginBottomProperties = { marginBottom: "15%" };
  }

  return {
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
    ...marginBottomProperties,
  };
});

export const sectionNameWrapperStyle = {
  display: "flex",
  alignSelf: "center",
  width: "93%",
  padding: "0.5rem 0 0.5rem 7%",
  flexShrink: 0,
};

export const UlWrapper = styled("ul")(() => {
  return {
    display: "inline-flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    margin: "1.5rem 0 0 2.5rem",
    paddingTop: "unset !important",
    overflowX: "auto",
    direction: "ltr",
    gap: "unset",
    "&::-webkit-scrollbar": {
      height: "0.8rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(170,170,170,1)",
      borderRadius: "0.3rem",
    },
  };
});

export const CardBoxStyle = styled("li")<{ zoomLevel: number }>(({
  zoomLevel,
}) => {
  let cardMargin = { margin: "0 1.5rem 2rem 0" };

  switch (zoomLevel) {
    case 0:
      cardMargin = { margin: "0 1.5rem 3rem 0" };
      break;
    case 1:
      cardMargin = { margin: "0 1.5rem 2rem 0" };
      break;
    case 2:
      cardMargin = { margin: "0 1.5rem 2rem 0" };
      break;
    case 3:
      cardMargin = { margin: "0 1.5rem 2rem 0" };
      break;
    case 4:
      cardMargin = { margin: "0 1.5rem 2rem 0" };
      break;
    case 5:
      cardMargin = { margin: "0 1.5rem 2rem 0" };
      break;
  }

  return { ...cardMargin };
});
