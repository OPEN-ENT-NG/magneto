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
  borderRadius: 1,
  display: "flex",
  flexDirection: "column",
};

export const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  p: "1rem 1.5rem",
};

export const titleStyle = {
  color: "#E50037",
  fontWeight: "bold",
};

export const closeButtonStyle = {
  fontSize: "2rem",
};

export const subtitleStyle = {
  fontWeight: "bold",
  fontSize: "1.6rem",
  p: "1rem 1.5rem",
};

export const contentContainerStyle = {
  flex: 1,
  overflowY: "auto",
  p: "1rem 1.5rem",
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
  whiteSpace: "normal",
  wordWrap: "break-word",
  overflowWrap: "break-word",
};
