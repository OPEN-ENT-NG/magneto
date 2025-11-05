import { CardActions, styled } from "@mui/material";

export const StyledCardActions = styled(CardActions, {
  shouldForwardProp: (prop) => prop !== "zoomLevel" && prop !== "isTheme1d",
})<{ zoomLevel: number; isTheme1D?: boolean }>(({ zoomLevel, isTheme1D }) => ({
  justifyContent: "space-between",
  padding: "0",
  paddingRight: "0.4rem",
  paddingBottom: 0,
  paddingTop: zoomLevel < 2 ? 0 : "1rem",
  alignItems: "center",
  ...(isTheme1D && { fontFamily: "Arimo" }),
}));

export const styledTypographyContainer = {
  display: "flex",
  alignItems: "center",
  flexGrow: 1,
  overflow: "hidden",
};

export const styledTypography = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  backgroundColor: "#f8f9fa",
  border: "3px solid #f8f9fa",
  borderTopRightRadius: "10px",
  borderBottomLeftRadius: "10px",
  fontSize: "14px",
  flexShrink: 0,
  fontFamily: "inherit",
};

export const styledLegendTypography = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "1.3rem",
  fontStyle: "italic",
  whiteSpace: "nowrap",
  marginLeft: "1rem",
  fontFamily: "inherit",
};

export const styledBox = {
  display: "flex",
  alignItems: "center",
};

export const simple14Typography = {
  fontSize: "1.4rem",
};

export const bottomIconButton = {
  paddingLeft: "0.2rem",
};
