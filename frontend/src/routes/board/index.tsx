import { BoardView } from "~/components/board-view/BoardView";
import { BoardProvider } from "~/providers/BoardProvider";

export const App = () => {
  return (
    <BoardProvider>
      <BoardView />
    </BoardProvider>
  );
};
