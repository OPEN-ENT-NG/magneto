import { SxProps, Theme } from "@mui/material";

const MAGNETO_GREY = "#333333";
const MAGNETO_WHITE = "#FFFFFF";
const MAGNETO_LIGHT_GREY = "#999999";

interface ContainerStyle {
  opacity: number;
}

interface IconStyle {
  disabled: boolean;
}

export const containerStyle = ({
  opacity,
}: ContainerStyle): SxProps<Theme> => ({
  backgroundColor: MAGNETO_GREY,
  color: MAGNETO_WHITE,
  borderRadius: "32px",
  padding: "8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  height: "4.2rem",
  width: "auto",
  zIndex: 2,
  opacity,
});

export const iconButtonStyle: SxProps<Theme> = {
  color: "inherit",
  padding: "0.1em",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.Mui-disabled": {
    color: MAGNETO_LIGHT_GREY,
  },
};

export const iconStyle = ({ disabled }: IconStyle): SxProps<Theme> => ({
  fontSize: "32px",
  color: disabled ? MAGNETO_LIGHT_GREY : "inherit",
});

export const lineStyle: SxProps<Theme> = {
  width: "40px",
  height: "1px",
  backgroundColor: MAGNETO_WHITE,
};

export const labelStyle: SxProps<Theme> = {
  margin: "0 0.75em",
  cursor: "pointer",
  border: "none",
  background: "none",
  color: "inherit",
  font: "inherit",
  padding: 0,
  "&:hover": {
    opacity: 0.8,
  },
};
