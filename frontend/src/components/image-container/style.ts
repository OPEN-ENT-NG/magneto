import { Box, styled } from "@mui/material";

export const mainBoxStyle = {
  position: "relative",
  width: "100%",
  height: "15rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "1rem",
  overflow: "hidden",
};

export const imageStyle = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
} as React.CSSProperties;

export const StyledIconButtonBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "imageBounds",
})<{
  imageBounds: {
    top: number;
    right: number;
  };
}>(({ imageBounds }) => ({
  position: "absolute",
  top: `${imageBounds.top}px`,
  right: `${imageBounds.right}px`,
  backgroundColor: "var(--edifice-white)",
  borderRadius: "0.8rem",
  width: "4rem",
  height: "4rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}));
