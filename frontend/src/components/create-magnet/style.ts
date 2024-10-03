export const modalContainerStyle = {
  position: "absolute",
  top: "2rem",
  left: "50%",
  transform: "translateX(-50%)",
  width: "80rem",
  maxWidth: "90%",
  maxHeight: "calc(100vh - 4rem)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "1.6rem",
  display: "flex",
  flexDirection: "column",
  padding: "3.2rem 5.2rem 3.2rem 5.2rem",
};

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

export const titleStyle = {
  fontWeight: "bold",
  fontFamily: "Comfortaa",
  fontSize: "2.6rem",
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
  marginTop: "1.4rem !important",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "6px",
    height: "6px",
  },
  "&::-webkit-scrollbar-button": {
    width: "0px",
    height: "0px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    border: "0px none #ffffff",
    borderRadius: "50px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#555",
  },
  "&::-webkit-scrollbar-thumb:active": {
    background: "#555",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
    border: "0px none #ffffff",
    borderRadius: "50px",
  },
  "&::-webkit-scrollbar-corner": {
    background: "transparent",
  },
  scrollbarWidth: "thin",
  scrollbarColor: "#888 transparent",
};

export const descriptionStyle = {
  fontSize: "1.4rem",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  overflowWrap: "break-word",
};
