import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";
import { SVGProvider } from "~/providers/SVGProvider";

export const App = () => {
  return (
    <BoardProvider>
      <SVGProvider>
          <BoardView />
      </SVGProvider>
    </BoardProvider>
  );
};
