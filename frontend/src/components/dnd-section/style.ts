import { styled } from "@mui/material";

import { SectionWrapperProps } from "./types";

const prepareWidth: (sectionNumber: number) => string = (sectionNumber) => {
    if (sectionNumber === 1) return "100%";
    if (sectionNumber === 2) return "50%";
    if (sectionNumber === 3) return "33%";
    if (sectionNumber === 4) return "25%";
    if (sectionNumber > 4) return "22%";
    return "";
};

export const SectionWrapper = styled("div")<SectionWrapperProps>(({
  sectionType,
  isLast = false,
  isDragging = false,
  noCards = true,
  sectionNumber = 0,
}) => {
 

  switch (sectionType) {
    case "vertical":
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
    case "horizontal":
      let marginBottomProperties = {};
      if (isLast) {
        marginBottomProperties = { marginBottom: "15%" };
      } else if (noCards) {
        marginBottomProperties = { marginBottom: "15%" };
      }

      return {
        transform: isDragging ? "scale(1.05)" : "scale(1)",
        opacity: isDragging ? "0.5" : "1",
        cursor: isDragging ? "grabbing" : "grab",
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
  }
});
