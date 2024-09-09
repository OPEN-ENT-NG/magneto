export const boxStyle = {
  position: "relative",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "5rem",
  padding: "1rem",
  backgroundColor: "white",
  borderRadius: "2.5rem",
  boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.1)",
};

export const inputStyle = {
  flex: 1,
  "& input": {
    textAlign: "center",
    fontSize: "2rem",
    color: "#5b6472",
    lineHeight: "1.5rem",
    padding: "0.5rem 0",
  },
};

export const iconButtonStyle = {
  padding: "0.25rem",
  marginLeft: "0.5rem",
  "&:hover": {
    backgroundColor: "transparent",
  },
};

export const iconStyle = { fontSize: "3rem" };
