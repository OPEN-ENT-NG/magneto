import { ThemeProvider } from "@mui/material/styles";

import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";
import { SVGProvider } from "~/providers/SVGProvider";
import theme from "~/themes/theme";

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BoardProvider>
        <SVGProvider>
          <BoardView />
        </SVGProvider>
      </BoardProvider>
    </ThemeProvider>
  );
};
