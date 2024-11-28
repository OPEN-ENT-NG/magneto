import { ThemeBreakpoint } from "./core/enums/theme-breakpoints.enum";

declare module "@mui/material/styles" {
  interface BreakpointOverrides {
    [key in ThemeBreakpoint]: true;
  }
}
