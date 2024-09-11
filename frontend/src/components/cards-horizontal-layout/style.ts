import { styled } from "@mui/material";

import { SectionWrapperProps } from "./types";

// const prepareWidth: (sectionNumber: number) => string = (sectionNumber) => {
//   if (sectionNumber === 1) return "50%";
//   if (sectionNumber === 2) return "33%";
//   if (sectionNumber === 3) return "25%";
//   if (sectionNumber > 3) return "22%";
//   return "";
// };

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
    // minWidth: "22%",
    width: "100%",
    // borderRight: !isLast ? "1px solid #aaa" : "",
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

export const MagnetWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignContent: "flex-start",
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
};

export const CardBoxStyle = styled("div")<{ zoomLevel: number }>(({
    zoomLevel,
  }) => {
    let cardSize = { width: "269px", height: "264px", margin: "15px" };
  
    const cardProperties = {
      backgroundColor: "white",
  
      display: "flex",
      position: "relative",
    };
  
    switch (
      zoomLevel //will be replaced by card size later --> card margins etc
    ) {
      case 0:
        cardSize = { width: "125px", height: "130px", margin: "2px" };
        break;
      case 1:
        cardSize = { width: "183px", height: "180px", margin: "5px" };
        break;
      case 2:
        cardSize = { width: "228px", height: "223px", margin: "10px" };
        break;
      case 3:
        cardSize = { width: "269px", height: "264px", margin: "15px" };
        break;
      case 4:
        cardSize = { width: "330px", height: "310px", margin: "5px" };
        break;
      case 5:
        cardSize = { width: "371px", height: "350px", margin: "15px" };
        break;
    }
  
    return { ...cardSize, ...cardProperties };
  });
