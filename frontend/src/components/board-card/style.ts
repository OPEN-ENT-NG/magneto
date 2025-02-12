import { CSS } from "@dnd-kit/utilities";
import { Card, styled } from "@mui/material";

export const handleCardSize = (zoomLevel: number) => {
  let cardSize = { width: "269px", height: "fit-content", minHeight: "264px" };

  switch (zoomLevel) {
    case 0:
      cardSize = { width: "132px", height: "130px", minHeight: "130px" };
      break;
    case 1:
      cardSize = { width: "183px", height: "180px", minHeight: "180px" };
      break;
    case 2:
      cardSize = { width: "228px", height: "fit-content", minHeight: "223px" };
      break;
    case 3:
      cardSize = { width: "269px", height: "fit-content", minHeight: "264px" };
      break;
    case 4:
      cardSize = { width: "330px", height: "fit-content", minHeight: "310px" };
      break;
    case 5:
      cardSize = { width: "371px", height: "fit-content", minHeight: "350px" };
      break;
  }
  return cardSize;
};

export const StyledCard = styled(Card, {
  shouldForwardProp: (prop) =>
    !["zoomLevel", "isDragging", "isLockedBoard", "isLocked"].includes(
      prop as string,
    ),
})<{
  zoomLevel: number;
  isDragging: boolean;
  isLockedBoard: boolean;
  isLocked: boolean;
}>(({
  zoomLevel = 3,
  isDragging = false,
  isLockedBoard = false,
  isLocked = false,
}) => {
  const LOCKED_CURSOR = "default !important";
  const DRAGGING_CURSOR = "grabbing";
  const DEFAULT_CURSOR = "grab";
  const cursor =
    ((isLockedBoard || isLocked) && LOCKED_CURSOR) ||
    (isDragging && DRAGGING_CURSOR) ||
    DEFAULT_CURSOR;

  return {
    display: "flex",
    position: "relative",
    flexDirection: "column",
    boxSizing: "border-box",
    overflow: "visible",
    borderRadius: "10px",
    boxShadow: "0 1px 3px rgba(0,0,0,.1)",
    width: handleCardSize(zoomLevel).width,
    height: handleCardSize(zoomLevel).height,
    opacity: isDragging ? "0.5" : "1",
    cursor,
  };
});

export const getTransformStyle = (
  transform: any,
  transition: any,
  listeners: any,
) => ({
  transform: CSS.Translate.toString({
    x: transform?.x ?? 0,
    y: transform?.y ?? 0,
    scaleX: 1,
    scaleY: 1,
  }),
  transition: transition || undefined,
  cursor: listeners ? "move" : "default",
});
