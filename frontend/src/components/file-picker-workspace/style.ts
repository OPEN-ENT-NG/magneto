export const svgContainerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "18rem",
  marginBottom: "1rem",
};

export const svgStyle = {
  height: "16rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
};

export const mediaNameStyle = {
  textAlign: "center" as const,
  fontSize: "1.6rem",
  whiteSpace: "nowrap" as const,
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "80%",
};

export const imageInputActions = {
  position: "absolute",
  top: "-0.8rem",
  right: "-0.8rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--edifice-white)",
  borderRadius: "0.8rem",
  width: "4rem",
  height: "4rem",
  overflow: "hidden",
};

export const iconButtonStyle = {
  padding: 0,
  minWidth: "auto",
  width: "3.2rem",
  height: "3.2rem",
} as React.CSSProperties;
