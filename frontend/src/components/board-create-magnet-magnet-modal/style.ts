import { FormControlLabel, styled } from "@mui/material";

import { BoardCardWrapperProps } from "./types";

export const modalContainerStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "110rem",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "1.6rem",
  display: "flex",
  maxHeight: "90vh",
  flexDirection: "column",
  padding: "3.2rem 5.2rem 3.2rem 5.2rem",
};

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

export const titleStyle = {
  fontWeight: "bold",
  fontFamily: "Comfortaa",
  fontSize: "1.8rem",
};

export const closeButtonStyle = {
  fontSize: "2.5rem",
  borderRadius: "0.8rem",
  position: "absolute",
  top: "1.5rem",
  right: "1.5rem",
  color: "#4a4a4a",
  opacity: 1,
};

export const contentContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginTop: "1.4rem !important",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "0.8rem",
    height: "0.8rem",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(170,170,170,1)",
    borderRadius: "0.3rem",
  },
};

export const descriptionStyle = {
  fontSize: "1.7rem",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  overflowWrap: "break-word",
};

export const modalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  gap: "1rem",
  height: "4rem",
};

export const duplicateButtonStyle = {
  marginTop: "1.5rem",
};

export const formGroupStyle = { flexDirection: "row", gap: ".5rem" };

export const StyledFormControlLabel = styled(FormControlLabel)(() => ({
  "& .MuiFormControlLabel-label": {
    fontSize: "1.5rem",
    color: "#4a4a4a",
    fontFamily: "Roboto, sans-serif",
  },
}));

export const boardTitleStyle = {
  fontSize: "2.6rem",
  fontFamily: "Comfortaa, cursive",
  color: "black",
  fontWeight: "700",
};

export const boardTitleWrapperStyle = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  marginBottom: "1.5rem",
};

export const boardTitleButton = { color: "black", textDecoration: "underline" };

export const listStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

export const BoardCardWrapper = styled("div")<BoardCardWrapperProps>(({
  isCardSelected = false,
}) => {
  const boardCardStyle = {
    border: isCardSelected ? "0.2rem solid #CEEAF5" : "",
    borderRadius: isCardSelected ? "10px" : "",
  };
  return boardCardStyle;
});
