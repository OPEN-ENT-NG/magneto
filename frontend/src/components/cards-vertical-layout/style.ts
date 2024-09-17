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
  overflowX: "auto",
  "&::-webkit-scrollbar": {
    height: "1.6rem",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(170,170,170,1)",
    borderRadius: "0.6rem",
    border: "0.4rem solid transparent",
    backgroundClip: "padding-box",
  },
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
    minWidth: "405px",
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

export const CardsWrapperStyle = (zoomLevel: number) => {
  // display: "flex",
  // flexWrap: "wrap",
  // justifyContent: "flex-start",
  // alignContent: "flex-start",
  // gap: "1rem",
  // overflowY: "auto",
  // flexGrow: 1,
  // width: "100%",
  // "&::-webkit-scrollbar": {
  //   width: "0.8rem",
  //   height: "0.8rem",
  // },
  // "&::-webkit-scrollbar-thumb": {
  //   backgroundColor: "rgba(170,170,170,1)",
  //   borderRadius: "0.3rem",
  // },

  let gap = { gap: "3rem" };

  switch (zoomLevel) {
    case 0:
      gap = { gap: "3rem" };
      break;
    case 1:
      gap = { gap: "3rem" };
      break;
    case 2:
      gap = { gap: "3rem" };
      break;
    case 3:
      gap = { gap: "3rem" };
      break;
    case 4:
      gap = { gap: "3rem" };
      break;
    case 5:
      gap = { gap: "3rem" };
      break;
  }

  return {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, 228px)",
    justifyContent: "center",
    flexWrap: "wrap",
    alignContent: "flex-start",
    overflowY: "auto",
    flexGrow: 1,
    width: "100%",
    "&::-webkit-scrollbar": {
      width: "0.8rem",
      height: "0.8rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(170,170,170,1)",
      borderRadius: "0.3rem",
    },
    ...gap,
  };
};

const prepareCardSize = (zoomLevel: number) => {
  switch (zoomLevel) {
    case 0:
      return { margin: "0 0.5rem 1.5rem 2rem" };

    case 1:
      return { margin: "0 auto 1.5rem" };

    case 2:
      return { margin: "0 auto 1.5rem" };

    case 3:
      return { margin: "0 auto 1.5rem" };

    case 4:
      return { margin: "0 0.25rem 1.5rem 0.25rem" };

    case 5:
      return { margin: "0 auto 1.5rem " };

    default:
      return { margin: "0 5rem 1.5rem 1rem" };
  }
};

export const CardWrapper = styled("div")<{ zoomLevel: number }>(({
  zoomLevel,
}) => {
  return {
    ...prepareCardSize(zoomLevel),
    display: "flex",
    position: "relative",
  };
});
