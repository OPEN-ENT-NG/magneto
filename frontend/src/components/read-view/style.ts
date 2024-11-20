export const contentStyle = {
  padding: "4rem 10rem",
  height: "100%",
  maxHeight: "100%",
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

export const styledContentBox = {
  width: "100%",
  height: "100%",
  maxHeight: "100%",
};

export const retourStyle = {
  position: "fixed",
  right: "40px",
  top: "80px",
} as React.CSSProperties;

export const boxStyle = {
  padding: "1rem 0",
  position: "relative",
  overflow: "visible",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as React.CSSProperties;

export const inputLabelStyle = { fontSize: "2rem" };

export const menuItemStyle = { fontSize: "2rem" };

export const selectStyle = {
  width: "55%",
  fontSize: "2rem",
  backgroundColor: "rgba(0, 0, 0, 0.01)",
  boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
  borderBottomRightRadius: "2rem",
  padding: "1rem",
  "&::before": {
    borderBottom: "none",
  },
  "&::after": {
    borderBottomColor: "grey",
    maxWidth: "calc(100% - 2rem)",
  },
  "&:hover::before": {
    maxWidth: "calc(100% - 2rem)",
  },
  "& .MuiSelect-select": {
    backgroundColor: "transparent !important",
  },
};

export const commentButtonWrapperStyle = {
  position: "fixed",
  bottom: "2rem",
  right: "2rem",
  zIndex: 1000,
};

export const leftNavigationStyle = {
  position: "fixed",
  left: "6%",
  top: "50%",
  backgroundColor: "white",
  border: "1px solid #e0e0e0",
  "&:hover": { backgroundColor: "white" },
  width: "7rem",
  height: "7rem",
  boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
  "& .MuiSvgIcon-root": {
    fontSize: "5rem",
  },
};

export const rightNavigationStyle = {
  position: "fixed",
  right: "6%",
  top: "50%",
  backgroundColor: "white",
  border: "1px solid #e0e0e0",
  "&:hover": { backgroundColor: "white" },
  width: "7rem",
  height: "7rem",
  boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
  "& .MuiSvgIcon-root": {
    fontSize: "5rem",
  },
};
