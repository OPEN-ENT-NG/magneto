import { createTheme } from "@mui/material/styles";

const theme = createTheme({
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

export default theme;
