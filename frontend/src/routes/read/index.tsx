import { BoardExplorer } from "~/components/board-explorer/BoardExplorer";
import { BoardProvider } from "~/providers/BoardProvider";
import { SVGProvider } from "~/providers/SVGProvider";

export const App = () => {
  return (
    <BoardProvider>
      <SVGProvider>
        <BoardExplorer />
      </SVGProvider>
    </BoardProvider>
  );
};
