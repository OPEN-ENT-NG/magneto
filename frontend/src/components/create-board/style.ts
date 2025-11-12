import { CSSProperties } from "react";

import { SxProps, Theme } from "@mui/material";

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
    marginBottom: "1.6rem",
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

export const subtitleStyle: SxProps<Theme> = {
  fontFamily: "Comfortaa",
  fontSize: "1.8rem",
  color: "black",
};

export const subtitleWithSpaceStyle: SxProps<Theme> = {
  fontFamily: "Comfortaa",
  fontSize: "1.8rem",
  color: "black",
  paddingBottom: "0.8rem",
};

export const subsubtitleStyle: SxProps<Theme> = {
  fontFamily: "Roboto",
  fontSize: "1.6rem",
  color: "black",
  opacity: "60%",
};

export const organisationBoxStyle: SxProps<Theme> = {
  marginTop: "1.5rem",
  marginBottom: "0.8rem",
};

export const radioLabelStyle: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  fontSize: "1.6rem",
};

export const radioIconStyle: SxProps<Theme> = {
  fontSize: "2.4rem",
  opacity: "60%",
  color: "black",
};

export const optionsBoxStyle: SxProps<Theme> = {
  paddingBottom: "2rem",
};

export const positionModeContainerStyle: SxProps<Theme> = {
  width: "100%",
};

export const positionModeBoxStyle: SxProps<Theme> = {
  width: "50%",
  display: "flex",
  alignItems: "center",
};

export const positionOptionsContainerStyle: SxProps<Theme> = {
  display: "flex",
};

export const positionOptionBoxStyle: SxProps<Theme> = {
  width: "50%",
  paddingLeft: "2rem",
};

export const newCardLabelStyle: SxProps<Theme> = {
  marginBottom: "0.5rem",
  fontSize: "1.4rem",
};

export const toggleButtonStyle: SxProps<Theme> = {
  "&.Mui-selected": {
    backgroundColor: "var(--theme-palette-primary-main)",
    color: "white",
    "&:hover": {
      backgroundColor: "var(--theme-palette-primary-dark)",
    },
  },
};

export const toggleButtonGroupStyle: SxProps<Theme> = {
  "& .MuiToggleButton-root": {
    fontSize: "1.3rem",
    padding: "0.8rem 0.8rem",
  },
};

export const iconButtonStyle: SxProps<Theme> = {
  marginRight: "0.6rem",
  fontSize: "2.1rem",
};

export const iconButtonEndStyle: SxProps<Theme> = {
  marginRight: "0.5rem",
  fontSize: "2.1rem",
};

export const selectFieldStyle: SxProps<Theme> = {
  minWidth: "250px",
  "& .MuiInputBase-root": {
    fontSize: "1.6rem",
  },
};

export const selectLabelStyle: SxProps<Theme> = {
  fontSize: "1.2rem",
  "&.MuiInputLabel-shrink": {
    transform: "translate(16px, -6px) scale(0.75)",
  },
};

export const selectMenuItemStyle: SxProps<Theme> = {
  "& .MuiMenuItem-root": {
    fontSize: "1.5rem",
  },
};

export const radioStyle: SxProps<Theme> = {
  "& .MuiSvgIcon-root": {
    fontSize: 20,
  },
};

export const radioGroupStyle: SxProps<Theme> = {
  width: "100%",
  justifyContent: "space-between",
};

export const paddingLeftHalfRemStyle: SxProps<Theme> = {
  paddingLeft: "0.5rem",
};

export const paddingBottomOneRemStyle: SxProps<Theme> = {
  paddingBottom: "1rem",
};

export const paddingBottomTwoRemStyle: SxProps<Theme> = {
  paddingBottom: "2rem",
};
