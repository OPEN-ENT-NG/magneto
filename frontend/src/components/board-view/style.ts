import { styled } from "@mui/material";

export const BoardViewWrapper = styled("div")<{
  layout: string;
}>(({ layout }) => {
  const boardStyle = {
    display: "contents",
  };

  let layoutStyle;

  switch (layout) {
    case "free":
      layoutStyle = { overflowY: "scroll", overflowX: "hidden" };
      break;
    case "vertical":
      layoutStyle = { overflowX: "scroll", overflowY: "hidden" };
      break;
    case "horizontal":
      layoutStyle = { overflowY: "scroll", overflowX: "hidden" };
      break;
    default:
      layoutStyle = { overflowY: "scroll", overflowX: "hidden" };
      break;
  }
  return { ...layoutStyle, ...boardStyle };
});

export const BoardBodyWrapper = styled("div")<{
  layout: string;
  headerHeight: number;
}>(({ layout, headerHeight }) => {
  const boardStyle = {
    position: "relative",
    display: "flex",
    borderTop: "solid 1px $magneto-white-blue",
    borderBottom: "solid 1px $magneto-white-blue",
    backgroundSize: "cover",
    width: "100%",
  };

  let layoutStyle;

  switch (layout) {
    case "free":
      layoutStyle = { height: `calc(120vh - ${headerHeight}px)` };
      break;
    case "vertical":
      layoutStyle = { height: `calc(100vh - ${headerHeight}px)` };
      break;
    case "horizontal":
      layoutStyle = {}; //changed in horizontal section dev
      break;
    default:
      layoutStyle = { height: `calc(100vh - ${headerHeight}px)` };
      break;
  }
  return { ...layoutStyle, ...boardStyle };
});
