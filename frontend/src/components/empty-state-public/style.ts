export const boxEmptyState = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
};

export const titleEmptyState = (isTheme1D: boolean) => ({
  textAlign: "center",
  fontWeight: "bold",
  fontFamily: isTheme1D ? "Arimo" : "Roboto",
  paddingBottom: "2rem",
  fontSize: "2rem",
});

export const contentEmptyState = (isTheme1D: boolean) => ({
  fontFamily: isTheme1D ? "Arimo" : "Roboto",
  fontSize: "1.6rem",
  lineHeight: "150%",
  letterSpacing: "0.15px",
});
