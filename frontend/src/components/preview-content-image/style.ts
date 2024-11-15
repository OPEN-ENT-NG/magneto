import { SxProps } from "@mui/material";

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
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  color: "#5b6472",
};

export const descriptionStyle: SxProps = {
  fontStyle: "italic",
  fontSize: "1.5rem",
  overflowX: "hidden",
  wordBreak: "break-word", // Permet de casser les mots longs
  overflowWrap: "break-word", // Support additionnel pour certains navigateurs
  textOverflow: "ellipsis",
  color: "#d6d6d6",
};
