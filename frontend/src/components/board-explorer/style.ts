export const contentStyle = {
  paddingRight: "1.6rem",
  paddingLeft: "15rem",
};

export const retourStyle = {
  position: "fixed",
  right: "6%",
  transform: "translateX(20%)",
  top: "6%",
} as React.CSSProperties;

export const boxStyle = {
  padding: "1rem 0",
  position: "relative",
  overflow: "visible",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
} as React.CSSProperties;

export const inputLabelStyle = { fontSize: "1.5rem" };

export const menuItemStyle = { fontSize: "1.5rem" };

export const selectStyle = {
  width: "55%",
  fontSize: "1.5rem",
  backgroundColor: "rgba(0, 0, 0, 0.01)",
  boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
  "&::before": {
    borderBottomColor: "#ededed",
  },
  "&::after": {
    borderBottomColor: "grey",
  },
  "&.Mui-focused": {
    backgroundColor: "#fafafa",
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

export const iconButtonReturnStyle = { padding: 0 };
