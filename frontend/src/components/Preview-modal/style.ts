import { Box, styled } from "@mui/material";

export const modalWrapperStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "120rem",
  maxWidth: "90%",
  maxHeight: "calc(100vh - 4rem)",
  height: "calc(100vh - 4rem)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "1.6rem",
  overflow: "hidden",
};

export const modalBodyStyle = {
  width: "100%",
  height: "100%",
  position: "relative",
  padding: "6rem 4rem",
  maxHeight: "100%",
  display: "flex",
};

export const contentWrapper = {
  flex: 1,
  maxWidth: "100%",
  minWidth: "60rem",
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
      zIndex: 1500,
    },
  }),
);
