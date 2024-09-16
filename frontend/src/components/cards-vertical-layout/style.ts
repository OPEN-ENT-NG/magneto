import { styled } from "@mui/material";

import { SectionWrapperProps } from "./types";

const prepareWidth: (sectionNumber: number) => string = (sectionNumber) => {
  if (sectionNumber === 1) return "50%";
  if (sectionNumber === 2) return "33%";
  if (sectionNumber === 3) return "25%";
  if (sectionNumber > 3) return "22%";
  return "";
};

export const mainWrapperProps = {
  width: "100%",
  height: "100%",
  display: "flex",
  background: "transparent",
  zIndex: "1",
};

export const SectionWrapper = styled("div")<SectionWrapperProps>(({
  sectionNumber,
  isLast = false,
}) => {
  return {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    padding: "1rem",
    minWidth: "22%",
    width: prepareWidth(sectionNumber),
    borderRight: !isLast ? "1px solid #aaa" : "",
    height: "100%",
    overflow: "hidden",
  };
});

export const sectionNameWrapperStyle = {
  display: "flex",
  alignItems: "center",
  width: "85%",
  padding: "0.5rem 0",
  flexShrink: 0,
  alignSelf: "center",
};

export const CardsWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-evenly flex-start",
  alignContent: "flex-start",
  gap: "1rem",
  overflowY: "auto",
  flexGrow: 1,
  width: "100%",
  "&::-webkit-scrollbar": {
    width: "0.8rem",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(170,170,170,1)",
    borderRadius: "0.3rem",
  },
};

export const CardWrapper = styled("div")<{ zoomLevel: number }>(({
  zoomLevel,
}) => {
  let cardSize = { margin: "0 5rem 1.5rem 1rem" };

  const cardProperties = {
    display: "flex",
    position: "relative",
  };

  switch (zoomLevel) {
    case 0:
      cardSize = { margin: "0 0.5rem 1.5rem 2rem" };
      break;
    case 1:
      cardSize = { margin: "0 auto 1.5rem" };
      break;
    case 2:
      cardSize = { margin: "0 auto 1.5rem" };
      break;
    case 3:
      cardSize = { margin: "0 auto 1.5rem" };
      break;
    case 4:
      cardSize = { margin: "0 0.25rem 1.5rem 0.25rem" };
      break;
    case 5:
      cardSize = { margin: "0 auto 1.5rem " };
      break;
  }

  return { ...cardSize, ...cardProperties };
});
