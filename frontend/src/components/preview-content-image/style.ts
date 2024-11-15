import { styled, SxProps } from "@mui/material";

export const imgContentWrapper = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

export const captionStyle = {
  fontStyle: "italic",
  fontSize: "1.5rem",
  overflowX: "hidden",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: "#5b6472",
};

export const descriptionStyle: SxProps = {
  fontSize: "1.5rem",
  overflowX: "hidden",
  wordBreak: "break-word",
  overflowWrap: "break-word",
  textOverflow: "ellipsis",
  color: "#5b6472",
};

export const ResponsiveImage = styled("img")({
  maxWidth: "100%",
  height: "auto",
  display: "block",
});
