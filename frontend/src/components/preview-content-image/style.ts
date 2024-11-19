import { styled } from "@mui/material";

export const imgContentWrapper = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

export const imgWrapper = {
  display: "inline-block",
  maxWidth: "100%",
};

export const ResponsiveImage = styled("img")({
  maxWidth: "100%",
  height: "auto",
  display: "block",
});
