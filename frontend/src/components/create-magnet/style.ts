export const modalContainerStyle = {
  position: "absolute",
  top: "2rem",
  left: "50%",
  transform: "translateX(-50%)",
  width: "160rem",
  maxWidth: "90%",
  maxHeight: "calc(100vh - 4rem)",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: "1.6rem",
  display: "flex",
  flexDirection: "column",
  padding: "3.2rem 1rem 3.2rem 5.2rem",
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
  paddingRight: "4.2rem",
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
  "& .post-content-editor .ProseMirror[contenteditable='true']": {
    minHeight: "180px",
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

export const modalFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  gap: "1rem",
};

export const editorStyle = {
  "& .ProseMirror[contenteditable='true']": {
    minHeight: "180px",
  },
};

export const formControlStyle = {
  marginBottom: "1rem",
};

export const formControlEditorStyle = {
  marginBottom: "3rem",
};

export const formControlMUIStyle = {
  minWidth: 200,
  marginBottom: "1rem",
  width: "100%",
};

export const inputLabelStyle = {
  background: "white",
  padding: "0.2rem 4px",
  marginLeft: "-4px",
  transform: "translate(14px, -9px) scale(0.75)",
  fontSize: "1.7rem",
};

export const selectStyle = {
  "& .MuiOutlinedInput-notchedOutline": {
    "& caption": {
      width: "0px",
      paddingTop: "0rem",
    },
  },
  "& .MuiSelect-select": {
    paddingTop: "10px",
    paddingBottom: "0px",
    fontSize: "1.7rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  height: "4rem",
  width: "100%",
};

export const menuItemStyle = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "1.7rem",
  width: "145rem",
  maxWidth: "100%",
};

export const footerButtonStyle = {
  marginLeft: "0",
};

export const audioWrapperStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};
