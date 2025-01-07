import { Box, styled } from "@mui/material";

import { ModalWrapperProps } from "./types";

export const ModalWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isCommentOpen",
})<ModalWrapperProps>(({ theme, isCommentOpen }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "max-content",
  minWidth: "80vw",
  maxWidth: "80%",
  height: isCommentOpen ? "calc(100vh - 10rem)" : "fit-content",
  maxHeight: "calc(100vh - 10rem)",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[24],
  borderRadius: "1.6rem",
  overflow: "hidden",
}));

export const modalBodyStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
  padding: "5rem",
  display: "flex",
};

export const StyledContentBox = styled(Box)<{ isCommentOpen?: boolean }>(
  ({ isCommentOpen }) => ({
    flex: 1,
    width: "fit-content",
    maxHeight: isCommentOpen ? "calc(100vh - 20rem)" : "60vh",
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      height: "1.6rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(170,170,170,1)",
      borderRadius: "0.6rem",
      border: "0.4rem solid transparent",
      backgroundClip: "padding-box",
    },
  }),
);

export const closeButtonStyle = {
  fontSize: "2.5rem",
  borderRadius: "0.8rem",
  position: "absolute",
  top: "1.5rem",
  right: "1.5rem",
  color: "#4a4a4a",
  opacity: 1,
};

export const commentButtonStyle = {
  fontSize: "2rem",
  position: "absolute",
  bottom: "1.5rem",
  right: "1.5rem",
  color: "#4a4a4a",
  borderRadius: "50%",
  boxShadow: "rgba(0, 0, 0, 0.1) 0px 4px 12px",
  opacity: 1,
};

export const CommentContainer = styled(Box)<{ isVisible: boolean }>(
  ({ isVisible }) => ({
    minWidth: "40rem",
    position: "relative",
    display: isVisible ? "block" : "none",
    marginRight: "2rem",
    "@media (max-width: 1200px)": {
      position: "absolute",
      zIndex: 20000,
    },
  }),
);

export const leftNavigationStyle = {
  position: "fixed",
  left: "8.2%",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "white",
  border: "1px solid #e0e0e0",
  "&:hover": { backgroundColor: "white" },
  width: "7rem",
  height: "7rem",
  boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
  "& .MuiSvgIcon-root": {
    fontSize: "5rem",
  },
  zIndex: 1500, // Supérieur au z-index de la Modal MUI
};

export const rightNavigationStyle = {
  position: "fixed",
  right: "8.2%",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "white",
  border: "1px solid #e0e0e0",
  "&:hover": { backgroundColor: "white" },
  width: "7rem",
  height: "7rem",
  boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
  "& .MuiSvgIcon-root": {
    fontSize: "5rem",
  },
  zIndex: 1500, // Supérieur au z-index de la Modal MUI
};
