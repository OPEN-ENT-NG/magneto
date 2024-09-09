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
