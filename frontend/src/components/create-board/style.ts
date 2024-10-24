import { CSSProperties } from "react";

export const styles: Record<string, CSSProperties> = {
  gridCol: {
    padding: ".8rem",
  },
  errorText: {
    marginTop: "0.3em",
    fontSize: "1.15rem",
    color: "red",
  },
  formControlSpacingSmall: {
    marginBottom: "0.5em",
  },
  formControlSpacingMedium: {
    marginBottom: "1em",
  },
  formControlSpacingLarge: {
    marginBottom: "1.5em",
  },
  footerButtonContainer: {
    float: "right" as const,
  },
  footerButton: {
    marginLeft: "0.25em",
    marginTop: "1.5em",
  },
  flexContainer: {
    display: "flex" as const,
    flexWrap: "wrap" as const,
  },
  flexCenterAligned: {
    display: "flex" as const,
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  flexSpaceAround: {
    display: "flex" as const,
    flexWrap: "wrap" as const,
    alignItems: "center",
    justifyContent: "space-around",
  },
  textIconPair: {
    display: "flex" as const,
    alignItems: "center",
    gap: "0.25em",
    marginRight: "0.75em",
  },
  layoutText: {
    marginRight: "0.15em",
    marginLeft: "0.15em",
    width: "max-content",
  },
  infoText: {
    fontSize: "1.2rem",
  },
  textArea: {
    borderColor: "var(--edifice-input-border-color)",
  },
  radioMargin: {
    marginRight: "0.4em",
  },
  layoutOptionsContainer: {
    alignItems: "center",
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  layoutOption: {
    flexWrap: "wrap",
    alignItems: "center",
    display: "flex",
    gap: ".25em",
  },
};
