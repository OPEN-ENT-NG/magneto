import { styled } from "@mui/material";

import { SectionWrapperProps } from "./types";

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