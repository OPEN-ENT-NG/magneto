import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      lg35: 1720,
      xl: 1920,
      xl35: 2600,
    },
  },
});

export default theme;
