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
      layoutStyle = { height: `100%`, minHeight: `100vh` };
      break;
    case "vertical":
      layoutStyle = { height: `calc(100vh - ${headerHeight}px)`, minHeight: `unset` };
      break;
    case "horizontal":
      layoutStyle = { height: `calc(100vh - ${headerHeight}px)`, minHeight: `100vh` }; 
      break;
    default:
      layoutStyle = { height: `100%`, minHeight: `100vh`  };
      break;
  }
  return { ...layoutStyle, ...boardStyle };
});
