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
  top: "0",
  right: "-0.5rem",
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--edifice-white)",
  borderRadius: "0.8rem",
};

export const iconButtonStyle = {
  "--edifice-btn-padding-x": "0.8rem",
  "--edifice-btn-padding-y": "0.8rem",
} as React.CSSProperties;
