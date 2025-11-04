import { SxProps, Theme } from "@mui/material";

export const wrapperStyles = (
  position: "start" | "middle" | "end",
): SxProps<Theme> => ({
  boxSizing: "border-box",
  margin: "25px 20px 10px 0px",
  width: "100%",
  display: "flex",
  justifyContent:
    position === "start"
      ? "flex-start"
      : position === "middle"
      ? "center"
      : "flex-end",
});

export const elementWrapperStyles: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

export const iconStyles: SxProps<Theme> = {
  width: 20,
  height: 20,
  color: "#5b6472",
  display: "flex",
  alignItems: "center",
};

export const textStyles = (isTheme1d: boolean): SxProps<Theme> => ({
  fontSize: 20,
  fontFamily: isTheme1d ? "Arimo" : "Roboto",
  lineHeight: "23px",
  color: "#5b6472",
});
