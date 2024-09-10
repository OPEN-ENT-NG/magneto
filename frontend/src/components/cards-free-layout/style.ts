import { styled } from "@mui/material";

export const cardBoxStyle = {
  width: "269px",
  height: "264px",
  backgroundColor: "white",
  margin: "15px",

  display: "flex",
  position: "relative",
  // justifyContent: "center",
  // alignItems: "center",
  // boxSizing: "border-box",
  // padding: "0 1rem",
  // marginTop: "67px",
};

export const CardBoxStyle = styled("div")<{ zoomLevel: number }>(({
  zoomLevel,
}) => {
  let cardSize = { width: "269px", height: "264px", margin: "15px" };

  let cardProperties = {
    backgroundColor: "white",

    display: "flex",
    position: "relative",
  };

  switch (zoomLevel) {
    case 0:
      cardSize = { width: "125px", height: "130px", margin: "2px" };
    case 1:
      cardSize = { width: "183px", height: "180px", margin: "5px" };
    case 2:
      cardSize = { width: "228px", height: "223px", margin: "10px" };
    case 3:
      cardSize = { width: "269px", height: "264px", margin: "15px" };
    case 4:
      cardSize = { width: "330px", height: "310px", margin: "5px" };
    case 5:
      cardSize = { width: "371px", height: "350px", margin: "15px" };
  }

  return { ...cardSize, ...cardProperties };
});

export const LiWrapper = styled("li")<{ isFirst: boolean }>(({ isFirst }) => {
  return isFirst ? { marginLeft: "30px" } : {};
});

export const UlWrapper = styled("ul")(() => {
  return {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: "15px",
  };
});
