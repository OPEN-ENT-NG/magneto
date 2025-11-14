export const toastStyle = (isTheme1D: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: ".5rem",
  background: "#bde4f9",
  padding: " .8rem .5rem",
  fontSize: "1.20rem",
  borderRadius: ".5rem",
  color: "#2a9cc8",
  textWrap: "nowrap",
  ...(isTheme1D && { fontFamily: "Arimo" }),
});
export const externalToastStyle = {
  display: "flex",
  alignItems: "center",
  gap: ".5rem",
  background: "#FAFDFF",
  padding: " .8rem .5rem",
  fontSize: "1.20rem",
  borderRadius: ".5rem",
  color: "#2a9cc8",
  textWrap: "nowrap",
};

export const externalToastTextStyle = { color: "#545F66" };

export const isLockedToastStyle = {
  display: "flex",
  alignItems: "center",
  gap: ".5rem",
  background: "#FFF4E5",
  padding: " .8rem .5rem",
  fontSize: "1.20rem",
  borderRadius: ".5rem",
  color: "#734B13",
  textWrap: "nowrap",
};

export const mainWrapperStyle = {
  padding: "1rem 2rem",
  width: "100%",
  gap: "1rem",
  display: "flex",
  flexDirection: "column",
};

export const wrapperBoxStyle = {
  width: "100%",
  maxWidth: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxSizing: "border-box",
};

export const leftWrapperStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  maxWidth: "100%",
};

export const rightWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  boxSizing: "border-box",
  gap: "1rem",
  flexShrink: 0,
  minWidth: "auto",
};

export const breadcrumbTitle = {
  fontFamily: "Comfortaa",
  fontSize: "1.75em",
  color: "#ecbe30",
  lineHeight: "1.2",
  fontWeight: "bold",
};

export const buttonStyle = {
  backgroundColor: "var(--theme-palette-primary-main)",
  fontSize: "1.6rem",
  fontWeight: "800",
  height: "4rem",
  minHeight: "4rem",
  borderRadius: "0.8rem !important",
  padding: "0.8rem 1.6rem",
};

export const readButtonStyle = {
  fontSize: "1.4rem",
};
