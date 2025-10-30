import { SxProps, Theme } from "@mui/material";

const MAGNETO_GREY = "#EEEEEEE5";
const MAGNETO_LIGHT_GREY = "#D6D6D6";
const MAGNETO_WHITE = "#FFFFFF";

interface ContainerStyle {
  opacity: number;
}

interface IconStyle {
  disabled: boolean;
}

export const searchInputStyle = {
  fontSize: "0.8rem",
  width: "24rem",
  height: "4rem",
  backgroundColor: "#FAFAFAE5",
  "& input": {
    fontSize: "1.6rem",
  },
  "& .MuiSvgIcon-root": {
    fontSize: "2rem",
  },
};

export const containerStyle = ({
  opacity,
}: ContainerStyle): SxProps<Theme> => ({
  backgroundColor: MAGNETO_GREY,
  color: MAGNETO_WHITE,
  borderRadius: "1.6rem",
  padding: "8px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  height: "5.8rem",
  width: "auto",
  zIndex: 2,
  opacity,
  backdropFilter: "blur(9px)",
});

export const iconButtonStyle: SxProps<Theme> = {
  color: "inherit",
  width: "4.4rem",
  height: "4.4rem",
  padding: "0.1em",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.Mui-disabled": {
    color: MAGNETO_LIGHT_GREY,
  },
};

export const iconStyle = ({ disabled }: IconStyle): SxProps<Theme> => ({
  fontSize: "3rem",
  color: disabled ? "inherit" : "#00000099",
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
  color: "#00000099",
  font: "inherit",
  padding: 0,
  "&:hover": {
    opacity: 0.8,
  },
};
