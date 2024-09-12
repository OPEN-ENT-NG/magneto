import { styled } from "@mui/material";

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
      cardSize = { width: "132px", height: "127px", margin: "2px" };
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
