import { Box, styled } from "@mui/material";

export const DragBox = styled(Box)<{ isDragging: boolean }>(
  ({ isDragging }) => ({
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    borderRadius: "1rem",
    border: isDragging ? "3px dashed #FF8D2E" : "none",
    backgroundColor: isDragging ? "rgba(255, 255, 255, 0.4)" : "transparent",
    zIndex: "1000",
  }),
);

export const innerBox = {
  position: "relative",
  width: "100%",
  height: "100%",
  transition: "margin 0.2s",
};

export const flyingBox = {
  position: "fixed",
  bottom: "20%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "38rem",
};

export const textStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "100%",
  color: "#4A4A4A",
  textAlign: "center",
  fontSize: "2rem",
  backgroundColor: "#FFFFFF",
  borderRadius: ".7rem",
  padding: "2rem",
  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
};

export const ellipsisBoxStyle = {
  overflowX: "hidden",
  textOverflow: "ellipsis",
};

export const whiteBoxStyle = {
  position: "absolute",
  minWidth: "2.7rem",
  maxWidth: "2.7rem",
  minHeight: "2.7rem",
  maxHeight: "2.7rem",
  backgroundColor: "#FFFFFF",
  bottom: "100%",
  left: "50%",
  transform: "translateX(-50%)",
};

export const cloudIconStyle = {
  position: "absolute",
  fontSize: "7rem",
  color: "#2A9AC7",
  bottom: "80%",
  left: "50%",
  transform: "translateX(-50%)",
};
