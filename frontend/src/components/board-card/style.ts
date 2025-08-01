import { CSS } from "@dnd-kit/utilities";
import { Card, Chip, styled } from "@mui/material";

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
    ![
      "zoomLevel",
      "isDragging",
      "isLockedBoard",
      "isLocked",
      "isBeingEdited",
      "editingUserColor",
    ].includes(prop as string),
})<{
  zoomLevel: number;
  isDragging: boolean;
  isLockedBoard: boolean;
  isLocked: boolean;
  isBeingEdited?: boolean;
  editingUserColor?: string;
}>(({
  zoomLevel = 3,
  isDragging = false,
  isLockedBoard = false,
  isLocked = false,
  isBeingEdited = false,
  editingUserColor,
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
    border:
      isBeingEdited && editingUserColor
        ? `3px solid ${editingUserColor}`
        : "none",
    cursor,
    // Ajout du pseudo-élément pour l'overlay d'opacité
    "&::before":
      isBeingEdited && !isDragging
        ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            borderRadius: "10px",
            zIndex: 1,
            pointerEvents: "none",
          }
        : {},
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

export const EditingChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "userColor",
})<{ userColor: string }>(({ userColor }) => ({
  position: "absolute",
  bottom: "-1px",
  right: "-1px",
  backgroundColor: `${userColor} !important`,
  color: "#fff !important",
  borderRadius: "8px 0 8px 0",
  fontSize: "12px",
  fontWeight: "500",
  zIndex: 11,
  opacity: "1 !important",
  border: "none",
  boxShadow: "none",
  fontFamily: "Inter, Arial, sans-serif",
  "& .MuiChip-label": {
    padding: "4px 8px 4px 4px",
    color: "#fff !important",
    fontFamily: "inherit",
  },
  "& .MuiChip-icon": {
    color: "#fff !important",
    marginLeft: "4px",
    marginRight: "0px",
  },
  "&:hover": {
    backgroundColor: `${userColor} !important`,
  },
  "&:focus": {
    backgroundColor: `${userColor} !important`,
  },
}));

export const iconStyle = { color: "#fff !important", fontSize: "14px" };
