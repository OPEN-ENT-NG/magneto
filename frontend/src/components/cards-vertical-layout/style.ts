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
  width: "100%",
  padding: "0.5rem 0",
  flexShrink: 0,
};

export const CardWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
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
