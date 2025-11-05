import { createTheme } from "@mui/material/styles";

export const createAppTheme = (isTheme1D: boolean) =>
  createTheme({
    typography: isTheme1D
      ? {
          fontFamily: "Arimo, sans-serif",
        }
      : undefined,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        mdcomment: 1360,
        lg: 1280,
        xl: 1920,
      },
    },
  });

export default createAppTheme(false);
