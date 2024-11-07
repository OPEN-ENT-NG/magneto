import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280, // "lg" correspond à 1280px
      xl: 1920,
    },
  },
});

export default theme;
