import { styled } from "@mui/material";

export const mainWrapperProps = {
  width: "100%",
  height: "100%",
  display: "flex",
  background: "transparent",
  zIndex: "1",
};

export const CardBoxStyle = styled("div")<{}>(({ zoomLevel }) => {});

export const LiWrapper = styled("li")<{ isLast: boolean; zoomLevel: number }>(({
  isLast,
  zoomLevel,
}) => {
  let lastCardBottomMargin = isLast ? { marginBottom: "30%" } : {};

  let cardSize = { margin: "15px" };

  const cardProperties = {
    display: "flex",
    position: "relative",
  };

  switch (zoomLevel) {
    case 0:
      cardSize = { margin: "0 2rem 0 1rem" };
      break;
    case 1:
      cardSize = { margin: "0 2rem 0 1rem" };
      break;
    case 2:
      cardSize = { margin: "0 2rem 0 1rem" };
      break;
    case 3:
      cardSize = { margin: "0 2rem 0 1rem" };
      break;
    case 4:
      cardSize = { margin: "0 2rem 0 1rem" };
      break;
    case 5:
      cardSize = { margin: "0 2rem 0 1rem" };
      break;
  }

  return { ...cardSize, ...cardProperties, ...lastCardBottomMargin };
  // return {  };
});

export const UlWrapper = styled("ul")(() => {
  return {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: "5rem",
    gap: "unset",
    // justifyContent: "space-evenly",
  };
});
