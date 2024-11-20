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

export const contentStyle = {
  paddingRight: "1.6rem",
  paddingLeft: "1.6rem",
};
