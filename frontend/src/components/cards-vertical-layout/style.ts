import { styled } from "@mui/material";

import { SectionWrapperProps } from "./types";
import { handleCardSize } from "../board-card/style";

const prepareWidth: (sectionNumber: number) => string = (sectionNumber) => {
  if (sectionNumber === 1) return "100%";
  if (sectionNumber === 2) return "50%";
  if (sectionNumber === 3) return "33%";
  if (sectionNumber === 4) return "25%";
  if (sectionNumber > 4) return "22%";
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
  sectionNumber = 0,
  isLast = false,
  isDragging = false,
}) => {
  return {
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
    padding: "1rem 0.1rem 1rem 0",
    minWidth: "420px",
    width: prepareWidth(sectionNumber),
    borderRight: !isLast ? "1px solid #aaa" : "",
    height: "100%",
    overflow: "hidden",

    transform: isDragging ? "scale(1.05)" : "scale(1)",
    opacity: isDragging ? "0.5" : "1",
    cursor: isDragging ? "grabbing" : "grab",
  };
});

export const sectionNameWrapperStyle = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  padding: "0.5rem 1.5rem 0.5rem 2rem",
  flexShrink: 0,
  alignSelf: "center",
};

export const CardsWrapper = styled("div")<{
  zoomLevel: number;
  isDragging?: boolean;
}>(({ zoomLevel, isDragging = false }) => ({
  gridTemplateColumns: `repeat(auto-fill, ${handleCardSize(zoomLevel).width})`,
  gap: "1.5rem",
  display: "grid",
  justifyContent: "space-evenly",
  flexWrap: "wrap",
  alignContent: "flex-start",
  overflowY: "auto",
  flexGrow: 1,
  width: "100%",
  "&::-webkit-scrollbar": {
    width: isDragging ? "0" : "0.8rem",
    height: isDragging ? "0" : "0.8rem",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: isDragging ? "transparent" : "rgba(170,170,170,1)",
    borderRadius: "0.3rem",
  },
}));

export const CardWrapper = styled("div")({
  display: "flex",
  position: "relative",
});
