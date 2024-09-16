import { styled } from "@mui/material";

export const mainWrapperProps = {
  width: "100%",
  height: "100%",
  display: "flex",
  background: "transparent",
  zIndex: "1",
};

export const LiWrapper = styled("li")<{ isLast: boolean; zoomLevel: number }>(({
  isLast,
  zoomLevel,
}) => {
  const lastCardBottomMargin = isLast ? { marginBottom: "30%" } : {};

  let cardMargin = { margin: "0 5rem 1.5rem 1rem" };

  const cardProperties = {
    display: "flex",
    position: "relative",
  };

  switch (zoomLevel) {
    case 0:
      cardMargin = { margin: "0 1rem 1.5rem 0" };
      break;
    case 1:
      cardMargin = { margin: "0 1rem 1.5rem 0" };
      break;
    case 2:
      cardMargin = { margin: "0 3.5rem 1.5rem 1rem" };
      break;
    case 3:
      cardMargin = { margin: "0 5rem 1.5rem 1rem" };
      break;
    case 4:
      cardMargin = { margin: "0 1.15rem 1.5rem 0" };
      break;
    case 5:
      cardMargin = { margin: "0 5rem 1.5rem 1rem" };
      break;
  }

  return { ...cardMargin, ...cardProperties, ...lastCardBottomMargin };
});

export const UlWrapper = styled("ul")(() => {
  return {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: "4.5rem",
    gap: "unset",
    justifyContent: "space-evenly flex-start",
  };
});
