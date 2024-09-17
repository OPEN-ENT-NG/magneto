import { PopoverOrigin } from "@mui/material";

import { Position } from "./types";

export const getAnchorOrigin: (pos: Position) => PopoverOrigin = (pos) => {
  switch (pos) {
    case "bottom-right":
      return { vertical: "bottom", horizontal: "right" };
    case "right-top":
      return { vertical: "top", horizontal: "right" };
    default:
      return { vertical: "bottom", horizontal: "right" };
  }
};

export const getTransformOrigin: (
  pos: Position,
  menuOffset: number,
) => PopoverOrigin = (pos, menuOffset) => {
  switch (pos) {
    case "bottom-right":
      return { vertical: -menuOffset, horizontal: "right" };
    case "right-top":
      return { vertical: "top", horizontal: -menuOffset };
    default:
      return { vertical: -menuOffset, horizontal: "right" };
  }
};
