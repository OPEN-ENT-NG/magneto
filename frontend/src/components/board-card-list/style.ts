import { styled } from "@mui/material";
import { handleCardSize } from "../board-card/style";

export const CardsWrapper = styled("div")<{ zoomLevel: number }>(({
    zoomLevel,
  }) => {
    return {
      gridTemplateColumns: `repeat(auto-fill, ${
        handleCardSize(zoomLevel).width
      })`,
      gap: "1.5rem",
      display: "grid",
      justifyContent: "space-evenly",
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
    };
  });
  
  export const CardWrapper = styled("div")({
    display: "flex",
    position: "relative",
  });