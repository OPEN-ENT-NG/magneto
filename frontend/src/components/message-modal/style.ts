import { Button, styled } from "@mui/material";

import { StyledButtonProps } from "./types";

export const modalContainerStyle = {
  position: "absolute",
  top: "30%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: "95rem",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "1.6rem",
  display: "flex",
  height: "fit-content",
  maxHeight: "90vh",
  flexDirection: "column",
  padding: "3.2rem 5.2rem 3.2rem 5.2rem",
};

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
  flexWrap: "wrap",
};

export const titleStyle = {
  fontWeight: "bold",
  fontFamily: "Comfortaa",
  fontSize: "2.6rem",
  padding: "3rem 0 0 3rem",
};

export const actionStyle = {
  paddingRight: "3rem",
};

export const dialogStyle = {
  "& .MuiDialog-paper": {
    width: "90%",
    maxWidth: "95rem",
  },
  "& [data-testid='CloseRoundedIcon']": {
    fontSize: "2.4rem",
  },
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

export const modalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  gap: "1rem",
  height: "100%",
  flexWrap: "wrap",
};

export const submitButtonsStyle = {
  marginTop: "1.5rem",
  display: "inline-flex",
  gap: "0.5rem",
  flexWrap: "wrap",
};

export const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isFilled",
})<StyledButtonProps>(({ isFilled }) => {
  const buttonFilledStyle = isFilled
    ? { backgroundColor: "#F17A17" }
    : { color: "#6e6e6e" };

  return {
    height: "100%",
    width: "fit-content",
    fontFamily: "Roboto, sans-serif",
    fontSize: "2rem",
    fontWeight: "bold",
    borderRadius: "0.8rem",
    minWidth: "10rem",
    textTransform: "unset",
    boxShadow: "unset",
    marginLeft: "0.5rem",
    marginTop: "2rem !important",
    boxSizing: "border-box",
    ...buttonFilledStyle,
    "&:hover": {
      backgroundColor: isFilled ? "#d97827" : "#f2f2f2",
      boxShadow: "unset",
    },
  };
});

export const contentContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  marginTop: "1.4rem  !important",
  overflowY: "auto",
  maxHeight: "70vh",
  "&::-webkit-scrollbar": {
    width: "0.8rem",
    height: "0.8rem",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(170,170,170,1)",
    borderRadius: "0.3rem",
  },
};
