import { styled } from "@mui/material";

import { MagnetWrapperProps, SectionWrapperProps } from "./types";

const prepareWidth: (sectionNumber: number) => string = (sectionNumber) => {
  if (sectionNumber === 1) return "50%";
  if (sectionNumber === 2) return "33%";
  if (sectionNumber > 2) return "25%";
  return "";
};
export const mainWrapperProps = {
  width: "100%",
  height: "100%",
  display: "flex",
  background: "transparent",
  zIndex: "1",
  overflowX: "scroll",
  overflowY: "hidden",
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
    minWidth: "25%",
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

export const MagnetWrapper = styled("div")<MagnetWrapperProps>(
  ({ sectionNumber }) => ({
    display: "flex",
    flexWrap: sectionNumber > 2 ? "nowrap" : "wrap",
    flexDirection: sectionNumber > 2 ? "column" : "row",
    alignItems: sectionNumber > 2 ? "center" : "flex-start",
    justifyContent: "center",
    gap: "1rem",
    overflowY: "auto",
    flexGrow: 1,
    width: "100%",
    "&::-webkit-scrollbar": {
      width: "0.4rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.3)",
      borderRadius: "0.2rem",
    },
  }),
);
