import { Box, styled } from "@mui/material";

import { BoardBodyWrapperProps, BoardViewWrapperProps } from "./types";
import { LAYOUT_TYPE } from "~/core/enums/layout-type.enum";

export const BoardViewWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "layout",
})<BoardViewWrapperProps>(({ layout }) => ({
  display: "contents",
  ...(layout === LAYOUT_TYPE.FREE && {
    overflowY: "scroll",
    overflowX: "hidden",
  }),
  ...(layout === LAYOUT_TYPE.VERTICAL && {
    overflowX: "scroll",
    overflowY: "hidden",
  }),
  ...(layout === LAYOUT_TYPE.HORIZONTAL && {
    overflowY: "scroll",
    overflowX: "hidden",
  }),
}));

export const BoardBodyWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "layout" && prop !== "headerHeight",
})<BoardBodyWrapperProps>(({ layout, headerHeight }) => {
  const boardStyle = {
    position: "relative",
    display: "flex",
    borderTop: "solid 1px $magneto-white-blue",
    borderBottom: "solid 1px $magneto-white-blue",
    backgroundSize: "cover",
    width: "100%",
  } as const;

  let layoutStyle: { height: string; minHeight: string };

  switch (layout) {
    case LAYOUT_TYPE.FREE:
      layoutStyle = {
        height: "100%",
        minHeight: "100vh",
      };
      break;
    case LAYOUT_TYPE.VERTICAL:
      layoutStyle = {
        height: `calc(100vh - ${headerHeight}px)`,
        minHeight: "unset",
      };
      break;
    case LAYOUT_TYPE.HORIZONTAL:
      layoutStyle = {
        height: "100%",
        minHeight: `calc(100vh - ${headerHeight}px)`,
      };
      break;
    default:
      layoutStyle = {
        height: "100%",
        minHeight: "100vh",
      };
      break;
  }

  return { ...layoutStyle, ...boardStyle };
});

export const mediaLibraryStyle = {
  position: "fixed",
  zIndex: 1100,
};

export const getMainContainerStyles = (
  hasEditRights: boolean,
  isTheme1D: boolean,
) => ({
  "main.container-fluid": {
    padding: "0 !important",
    width: "100%",
    margin: hasEditRights
      ? isTheme1D
        ? "0 0 0 14.1rem"
        : "0 0 0 8.1rem"
      : "auto",
    maxWidth: "93% !important",
    "@media (max-width: 1280px)":
      isTheme1D && hasEditRights
        ? {
            margin: "0 0 0 11.6rem",
          }
        : {},
  },
});
