import { ThemeProvider } from "@mui/material/styles";

import { ReadView } from "~/components/read-view/ReadView";
import { BoardProvider } from "~/providers/BoardProvider";
import { SVGProvider } from "~/providers/SVGProvider";
import theme from "~/themes/theme";

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BoardProvider>
        <SVGProvider>
          <ReadView />
        </SVGProvider>
      </BoardProvider>
    </ThemeProvider>
  );
};
